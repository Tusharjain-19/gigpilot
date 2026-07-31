import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Target, Save } from 'lucide-react';
import { api } from '../services/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [goal, setGoal] = useState('');
  const [userId, setUserId] = useState(null);

  // Mock login logic
  useEffect(() => {
    const login = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'demo', password: 'password' })
        });
        const data = await res.json();
        if (data.user) {
          setUserId(data.user.id);
          fetchProfile(data.user.id);
        }
      } catch (err) {
        console.error('Login error', err);
      }
    };
    login();
  }, []);

  const fetchProfile = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${id}`);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setGoal(data.user.savings_goal);
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Profile fetch error', err);
    }
  };

  const updateGoal = async () => {
    try {
      await fetch(`http://localhost:5000/api/profile/${userId}/goal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savings_goal: parseFloat(goal) })
      });
      fetchProfile(userId);
    } catch (err) {
      console.error('Goal update error', err);
    }
  };

  if (!user) return <div className="p-4 text-center">Loading profile...</div>;

  // Comparison Logic
  const getTotals = (startDate, endDate) => {
    return jobs.filter(j => {
      const jd = new Date(j.date);
      return jd >= startDate && jd <= endDate;
    }).reduce((sum, j) => sum + j.earnings, 0);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setMilliseconds(-1);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(startOfMonth);
  endOfLastMonth.setMilliseconds(-1);

  const todayEarn = getTotals(today, endOfToday);
  const yesterdayEarn = getTotals(yesterday, endOfYesterday);
  
  const weekEarn = getTotals(startOfWeek, endOfToday);
  const lastWeekEarn = getTotals(startOfLastWeek, endOfLastWeek);

  const monthEarn = getTotals(startOfMonth, endOfToday);
  const lastMonthEarn = getTotals(startOfLastMonth, endOfLastMonth);

  const renderComparison = (label, current, previous) => {
    const diff = current - previous;
    const isUp = diff >= 0;
    return (
      <div className="bg-slate-100 dark:bg-[#1A1D24] p-4 rounded-xl flex justify-between items-center mb-3 border border-slate-200 dark:border-slate-800">
        <div>
          <h4 className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</h4>
          <div className="text-xl font-bold mt-1 text-slate-800 dark:text-white">₹{current.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">vs Prev: ₹{previous.toFixed(2)}</div>
          <div className={`mt-1 flex items-center justify-end text-sm font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
            {isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            ₹{Math.abs(diff).toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  const currentSavings = monthEarn; // Mock current savings as month earnings
  const progressPercent = Math.min(100, Math.max(0, (currentSavings / user.savings_goal) * 100));

  return (
    <div className="space-y-6">
      {/* Savings Goal Section */}
      <div className="bg-white dark:bg-[#111318] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-[#272A31]">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Savings Goal</h3>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 dark:text-slate-400">Current: ₹{currentSavings}</span>
            <span className="text-slate-800 dark:text-white font-medium">Goal: ₹{user.savings_goal}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-[#1A1D24] rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex space-x-3 items-center">
          <input 
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none"
            placeholder="New Goal"
          />
          <button 
            onClick={updateGoal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Update
          </button>
        </div>
      </div>

      {/* Comparisons */}
      <div className="bg-white dark:bg-[#111318] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-[#272A31]">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Performance</h3>
        </div>
        
        <div className="space-y-3">
          {renderComparison("Today vs Yesterday", todayEarn, yesterdayEarn)}
          {renderComparison("This Week vs Last", weekEarn, lastWeekEarn)}
          {renderComparison("This Month vs Last", monthEarn, lastMonthEarn)}
        </div>
      </div>
    </div>
  );
}
