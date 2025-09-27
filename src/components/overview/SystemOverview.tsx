import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Smartphone, 
  Wifi,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Eye,
  Fingerprint,
  Radio
} from "lucide-react";

interface SystemOverviewProps {
  onViewChange: (view: string) => void;
}

export function SystemOverview({ onViewChange }: SystemOverviewProps) {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12 bg-gradient-hero rounded-2xl">
        <div className="w-20 h-20 bg-gradient-scan rounded-full flex items-center justify-center mx-auto shadow-glow">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Automated Student Attendance
            <span className="gradient-text block">Monitoring System</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Advanced biometric verification with 3-phase security protocol ensuring accurate, 
            fraud-proof attendance tracking through face recognition, fingerprint authentication, 
            and NFC presence verification.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => onViewChange("faculty")}
            className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-medium"
          >
            View Faculty Dashboard
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => onViewChange("student")}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Try Student App
            <Smartphone className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* 3-Phase Verification Process */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">2-Phase Verification Protocol</h2>
          <p className="text-muted-foreground">Multi-layered biometric security ensuring 100% attendance accuracy</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Phase 1: Face Verification */}
          <Card className="group hover:shadow-medium transition-all duration-smooth cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-scan rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-smooth">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Phase 1: Face Recognition</CardTitle>
              <CardDescription>AI-powered facial verification with liveness detection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">RetinaFace/MTCNN Detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">ArcFace/FaceNet Embeddings</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">Anti-Spoofing CNN</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">0.85 Cosine Similarity Threshold</span>
                </div>
              </div>
              <Badge variant="outline" className="w-full justify-center">
                Real-time Processing
              </Badge>
            </CardContent>
          </Card>

          {/* Phase 2: Fingerprint Verification */}
          <Card className="group hover:shadow-medium transition-all duration-smooth cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-verify rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-smooth">
                <Fingerprint className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Phase 2: Fingerprint Auth</CardTitle>
              <CardDescription>Device-based biometric authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">Android BiometricPrompt</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">iOS LocalAuthentication</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">Cryptographic Proof Tokens</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">No Raw Data Storage</span>
                </div>
              </div>
              <Badge variant="outline" className="w-full justify-center">
                Hardware Security Module
              </Badge>
            </CardContent>
          </Card>

          {/* Phase 3: NFC Presence */}
         
        </div>
      </section>

      {/* System Statistics */}
      <section className="grid md:grid-cols-4 gap-6">
        <Card className="text-center hover:shadow-medium transition-all duration-smooth">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success mb-2">99.9%</div>
            <p className="text-sm text-muted-foreground">Accuracy Rate</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-medium transition-all duration-smooth">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary mb-2">&lt;2s</div>
            <p className="text-sm text-muted-foreground">Verification Time</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-medium transition-all duration-smooth">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-secondary mb-2">256-bit</div>
            <p className="text-sm text-muted-foreground">Encryption</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-medium transition-all duration-smooth">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-warning mb-2">0</div>
            <p className="text-sm text-muted-foreground">False Positives</p>
          </CardContent>
        </Card>
      </section>

      {/* Technology Stack */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Complete Technology Stack</h2>
          <p className="text-muted-foreground">Production-ready architecture with enterprise security</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <span>Mobile Applications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p>• React Native + Expo</p>
                <p>• TensorFlow Lite</p>
                <p>• Expo Camera & Authentication</p>
                <p>• NFC Manager Integration</p>
                <p>• Offline Data Caching</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Web Portal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p>• React + TypeScript</p>
                <p>• Tailwind CSS + ShadCN</p>
                <p>• Real-time WebSockets</p>
                <p>• Recharts Analytics</p>
                <p>• Excel/PDF Export</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>ML Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p>• Python FastAPI</p>
                <p>• RetinaFace + ArcFace</p>
                <p>• Anti-Spoofing CNN</p>
                <p>• 512D Vector Embeddings</p>
                <p>• GPU Acceleration</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-6 py-12">
        <h2 className="text-3xl font-bold text-foreground">Experience the Future of Attendance</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our interactive demo to see how biometric verification revolutionizes 
          student attendance monitoring with unprecedented accuracy and security.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            size="lg"
            onClick={() => onViewChange("faculty")}
            className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-medium"
          >
            <Users className="mr-2 w-5 h-5" />
            Faculty Dashboard Demo
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => onViewChange("analytics")}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <AlertTriangle className="mr-2 w-5 h-5" />
            View Analytics
          </Button>
        </div>
      </section>
    </div>
  );
}