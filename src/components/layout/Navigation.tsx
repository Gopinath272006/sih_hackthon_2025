import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  QrCode, 
  BarChart3, 
  Settings, 
  Shield, 
  Smartphone,
  Menu,
  X
} from "lucide-react";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigationItems = [
  { id: "overview", label: "System Overview", icon: Shield },
  { id: "faculty", label: "Faculty Dashboard", icon: Users },
  { id: "student", label: "Student App", icon: Smartphone },
  { id: "studentnumber", label: "ML Verification", icon: Shield },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "qr-generator", label: "QR Generator", icon: QrCode },
  { id: "admin", label: "Admin Panel", icon: Settings },
  { id: "Parents", label: "ParentsDashboard", icon: Settings },
   
];

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border shadow-soft  sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-scan rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CampusGate</h1>
              <p className="text-xs text-muted-foreground">Biometric Monitoring System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-medium" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Status Badge */}
          <div className="hidden md:flex items-center space-x-3">
            <Badge variant="outline" className="text-success border-success bg-success-light">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
              System Online
            </Badge>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="grid grid-cols-2 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-start space-x-2 w-full ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}