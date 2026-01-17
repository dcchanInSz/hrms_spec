import { useState, useEffect, useMemo } from 'react';
import { leaveAPI, teamAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';

/**
 * TeamCalendar Page
 * 团队日历页面 - 显示团队成员的请假安排
 */
function TeamCalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveEvents, setLeaveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'

  useEffect(() => {
    loadTeamCalendar();
  }, [currentDate]);

  const loadTeamCalendar = async () => {
    try {
      setLoading(true);
      const startDate = getMonthStartDate();
      const endDate = getMonthEndDate();

      const response = await leaveAPI.getTeamLeaves({
        start_date: startDate,
        end_date: endDate,
        limit: 100,
      }) as any;

      const events = (response?.data?.data || []).filter(
        (leave: any) => leave.status === 'approved' || leave.status === 'pending'
      );
      setLeaveEvents(events);
    } catch (err) {
      console.error('Failed to load team calendar:', err);
      setLeaveEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getMonthStartDate = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return `${year}-${String(month + 1).padStart(2, '0')}-01`;
  };

  const getMonthEndDate = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      annual: 'bg-blue-500',
      sick: 'bg-red-500',
      personal: 'bg-yellow-500',
      other: 'bg-gray-500',
    };
    return colors[type] || colors.other;
  };

  const getLeaveTypeName = (type) => {
    const names = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      other: '其他',
    };
    return names[type] || type;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 生成月份日历数据
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // 添加空白天数
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // 添加当月天数
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // 查找该日期的请假事件
      const eventsOnDay = leaveEvents.filter((event) => {
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);
        return date >= start && date <= end;
      });

      days.push({
        date: dateStr,
        day: d,
        isCurrentMonth: true,
        isWeekend: isWeekend(date),
        isToday: isToday(date),
        events: eventsOnDay,
      });
    }

    return days;
  }, [currentDate, leaveEvents]);

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div>
      <h1 className="page-title">团队日历</h1>

      {/* 日历头部 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="secondary" size="small" onClick={() => navigateMonth(-1)}>
                &lt; 上月
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
              </h2>
              <Button variant="secondary" size="small" onClick={() => navigateMonth(1)}>
                下月 &gt;
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="small" onClick={goToToday}>
                今天
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'month' ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => setViewMode('month')}
                >
                  月视图
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => setViewMode('week')}
                >
                  周视图
                </Button>
              </div>
            </div>
          </div>

          {/* 图例 */}
          <div className="flex items-center space-x-6 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>年假</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>病假</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>事假</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>其他</span>
            </div>
          </div>

          {/* 日历网格 */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* 星期行 */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {weekDays.map((day) => (
                  <div key={day} className="py-3 text-center text-sm font-medium text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              {/* 日期网格 */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] p-2 border-b border-r border-gray-200
                      ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                      ${day.isToday ? 'bg-blue-50' : ''}
                    `}
                  >
                    {day.date && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`
                              text-sm font-medium
                              ${day.isToday ? 'text-primary-600' : day.isWeekend ? 'text-gray-500' : 'text-gray-900'}
                            `}
                          >
                            {day.day}
                          </span>
                          {day.isToday && (
                            <span className="text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded">
                              今天
                            </span>
                          )}
                        </div>

                        {/* 事件列表 */}
                        <div className="space-y-1">
                          {day.events.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`
                                text-xs px-1.5 py-0.5 rounded truncate cursor-pointer
                                ${getLeaveTypeColor(event.leave_type)} text-white
                                hover:opacity-80 transition-opacity
                              `}
                              title={`${event.employee_name} - ${getLeaveTypeName(event.leave_type)}`}
                            >
                              {event.employee_name?.charAt(0) || '?'}
                              {getLeaveTypeName(event.leave_type)}
                            </div>
                          ))}
                          {day.events.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{day.events.length - 3} 更多
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 待审批提示 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">本月概览</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">年假</p>
              <p className="text-2xl font-bold text-blue-900">
                {leaveEvents.filter((e) => e.leave_type === 'annual').length}
                <span className="text-sm font-normal text-blue-600 ml-1">人次</span>
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 mb-1">病假</p>
              <p className="text-2xl font-bold text-red-900">
                {leaveEvents.filter((e) => e.leave_type === 'sick').length}
                <span className="text-sm font-normal text-red-600 ml-1">人次</span>
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 mb-1">事假</p>
              <p className="text-2xl font-bold text-yellow-900">
                {leaveEvents.filter((e) => e.leave_type === 'personal').length}
                <span className="text-sm font-normal text-yellow-600 ml-1">人次</span>
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">总计</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveEvents.length}
                <span className="text-sm font-normal text-gray-600 ml-1">人次</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 事件详情弹窗 */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedEvent(null)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">请假详情</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">员工</span>
                  <span className="font-medium">{selectedEvent.employee_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">类型</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getLeaveTypeColor(selectedEvent.leave_type)} text-white`}>
                    {getLeaveTypeName(selectedEvent.leave_type)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">时间</span>
                  <span className="font-medium">
                    {formatDate(selectedEvent.start_date)} - {formatDate(selectedEvent.end_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">天数</span>
                  <span className="font-medium">{selectedEvent.days} 天</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">状态</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    selectedEvent.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEvent.status === 'approved' ? '已批准' : '待审批'}
                  </span>
                </div>
                {selectedEvent.reason && (
                  <div>
                    <span className="text-gray-500">原因</span>
                    <p className="mt-1 text-sm text-gray-700">{selectedEvent.reason}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamCalendarPage;
