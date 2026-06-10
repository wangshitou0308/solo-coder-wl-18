import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import DataManagement from '@/pages/DataManagement';

const PAGE_TITLES: Record<string, string> = {
  dashboard: '统计看板',
  resumes: '简历管理',
  companies: '目标公司',
  interviews: '面试记录',
  questions: '面试题库',
  salary: '薪资谈判',
  timeline: '求职时间线',
  data: '数据管理',
};

const VALID_PAGES = new Set(Object.keys(PAGE_TITLES));

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('dashboard');

  useEffect(() => {
    const raw = location.pathname.replace('/', '') || 'dashboard';
    const path = VALID_PAGES.has(raw) ? raw : 'dashboard';
    setActiveKey(path);
    if (raw !== '' && !VALID_PAGES.has(raw)) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleMenuClick = (key: string) => {
    const target = key === 'dashboard' ? '/' : `/${key}`;
    if (location.pathname !== target) {
      navigate(target);
    }
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
            <Route path="/data" element={<DataManagement />} />
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
