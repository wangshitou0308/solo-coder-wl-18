import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/pages/Dashboard';
import Resumes from '@/pages/Resumes';
import Companies from '@/pages/Companies';
import Interviews from '@/pages/Interviews';
import Questions from '@/pages/Questions';
import Salary from '@/pages/Salary';
import Timeline from '@/pages/Timeline';
import Home from '@/pages/Home';

const PAGE_TITLES: Record<string, string> = {
  dashboard: '统计看板',
  resumes: '简历管理',
  companies: '目标公司',
  interviews: '面试记录',
  questions: '面试题库',
  salary: '薪资谈判',
  timeline: '求职时间线',
};

function AppLayout() {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('dashboard');

  useEffect(() => {
    const path = location.pathname.replace('/', '') || 'dashboard';
    setActiveKey(PAGE_TITLES[path] ? path : 'dashboard');
  }, [location.pathname]);

  const handleMenuClick = (key: string) => {
    window.history.pushState({}, '', `/${key === 'dashboard' ? '' : key}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="flex min-h-screen w-full relative">
      <Sidebar activeKey={activeKey} onMenuClick={handleMenuClick} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={PAGE_TITLES[activeKey] || '统计看板'} />
        <main className="flex-1 min-h-0 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Home />} />
            <Route path="/resumes" element={<Resumes />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/salary" element={<Salary />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
