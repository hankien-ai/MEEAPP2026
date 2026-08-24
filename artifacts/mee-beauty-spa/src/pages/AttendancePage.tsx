import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // nếu có router, nếu không thì dùng props
import { attendanceService } from '../services/attendance.service';
import { Button, Card, Spinner, Badge } from '../components/primitives';

interface Props {
  staffId?: string; // nếu dùng props thay vì router
}

export const AttendancePage: React.FC<Props> = ({ staffId: propStaffId }) => {
  const [staffId, setStaffId] = useState<string | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lấy staffId từ props hoặc từ auth context
  useEffect(() => {
    // Tạm thời lấy staff đầu tiên (sau này sẽ lấy từ auth)
    const fetchStaff = async () => {
      const { data } = await supabase.from('staff').select('id').limit(1).single();
      if (data) setStaffId(data.id);
    };
    if (!propStaffId) {
      fetchStaff();
    } else {
      setStaffId(propStaffId);
    }
  }, [propStaffId]);

  useEffect(() => {
    if (staffId) {
      loadTodayAttendance();
    }
  }, [staffId]);

  const loadTodayAttendance = async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const data = await attendanceService.getTodayAttendance(staffId);
      setTodayAttendance(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!staffId) return;
    setSubmitting(true);
    try {
      const result = await attendanceService.checkIn(staffId);
      setTodayAttendance(result);
      setMessage({ type: 'success', text: '✅ Check-in thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi check-in' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!staffId) return;
    setSubmitting(true);
    try {
      const result = await attendanceService.checkOut(staffId);
      setTodayAttendance(result);
      setMessage({ type: 'success', text: '✅ Check-out thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi check-out' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner className="py-8" />;

  const isCheckedIn = todayAttendance?.check_in !== null && todayAttendance?.check_in !== undefined;
  const isCheckedOut = todayAttendance?.check_out !== null && todayAttendance?.check_out !== undefined;
  const isComplete = isCheckedIn && isCheckedOut;

  return (
    <div className="p-4 max-w-sm mx-auto space-y-6">
      <h1 className="text-xl font-bold">Chấm công</h1>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <Card>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Hôm nay</span>
            <Badge variant={isComplete ? 'success' : isCheckedIn ? 'warning' : 'neutral'}>
              {isComplete ? 'Đã hoàn tất' : isCheckedIn ? 'Đã check-in' : 'Chưa check-in'}
            </Badge>
          </div>

          {isCheckedIn && (
            <div className="text-xs text-gray-500">Check-in: {new Date(todayAttendance.check_in).toLocaleTimeString()}</div>
          )}
          {isCheckedOut && (
            <div className="text-xs text-gray-500">Check-out: {new Date(todayAttendance.check_out).toLocaleTimeString()}</div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {!isCheckedIn && (
              <Button variant="primary" size="lg" onClick={handleCheckIn} disabled={submitting}>
                🟢 Check-in
              </Button>
            )}
            {isCheckedIn && !isCheckedOut && (
              <Button variant="secondary" size="lg" onClick={handleCheckOut} disabled={submitting}>
                🔴 Check-out
              </Button>
            )}
            {isComplete && (
              <div className="col-span-2 text-center text-sm text-gray-500">✅ Đã hoàn tất chấm công hôm nay</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AttendancePage;