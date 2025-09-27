import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { SystemOverview } from "@/components/overview/SystemOverview";
import { FacultyDashboard } from "@/components/faculty/FacultyDashboard";
import{StudentInterfacestwo} from "@/components/student/StudentInterfacestwo"
import { StudentInterfacesthree} from "@/components/student/Studentverify";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { MLVerificationDemo } from "@/components/ml/MLVerificationDemo";
import { AdminPanel } from "@/components/admin/AdminPanel";
import {ParentsDashboard} from "@/components/Parents/ParentsDashboard";


const Index = () => {
  const [activeView, setActiveView] = useState("overview");

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <SystemOverview onViewChange={setActiveView} />;
      case "faculty":
        return <FacultyDashboard />;
      case "student":
        return <StudentInterfacestwo />;
      case "studentnumber":
        return <StudentInterfacesthree/>;
      case "analytics":
        return <AnalyticsDashboard />;
      case "qr-generator":
        return <QRGenerator />;
      case "admin":
        return <AdminPanel />;
         case "Parents":
        return <ParentsDashboard />;
      default:
        return <SystemOverview onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main className="min-h-[calc(100vh-4rem)]">
        {renderView()}
      </main>
    </div>
  );
};

export default Index;
