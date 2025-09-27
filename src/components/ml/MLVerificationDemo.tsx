import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  Upload, 
  Brain, 
  Shield, 
  Eye,
  Target,
  Cpu,
  Zap,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Settings
} from "lucide-react";

export function MLVerificationDemo() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock ML processing simulation
  const processImage = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    // Simulate ML processing steps
    const steps = [
      { name: "Face Detection", duration: 800 },
      { name: "Feature Extraction", duration: 1200 },
      { name: "Liveness Check", duration: 600 },
      { name: "Embedding Generation", duration: 900 },
      { name: "Similarity Matching", duration: 400 }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Mock results
    setResults({
      match: Math.random() > 0.3, // 70% chance of match
      confidence: 0.92,
      livenessScore: 0.89,
      processingTime: 3.9,
      embedding: Array.from({length: 8}, () => Math.random().toFixed(3)),
      detectedFeatures: {
        faceDetected: true,
        eyesOpen: true,
        facingCamera: true,
        goodLighting: true,
        noObstructions: true
      }
    });

    setIsProcessing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage();
    }
  };

  const modelSpecs = [
    {
      name: "RetinaFace",
      purpose: "Face Detection",
      accuracy: "99.1%",
      speed: "15ms",
      description: "State-of-the-art face detection with landmark localization"
    },
    {
      name: "ArcFace",
      purpose: "Feature Extraction", 
      accuracy: "99.8%",
      speed: "25ms",
      description: "Deep face recognition with additive angular margin loss"
    },
    {
      name: "Anti-Spoof CNN",
      purpose: "Liveness Detection",
      accuracy: "98.7%", 
      speed: "12ms",
      description: "Prevents photo/video replay attacks with texture analysis"
    },
    {
      name: "FaceNet",
      purpose: "Embedding Generation",
      accuracy: "99.6%",
      speed: "18ms", 
      description: "512-dimensional face embeddings for similarity matching"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-scan rounded-full flex items-center justify-center mx-auto">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">ML Verification Demo</h1>
          <p className="text-muted-foreground">Interactive facial recognition and liveness detection</p>
        </div>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="models">ML Models</TabsTrigger>
          <TabsTrigger value="pipeline">Processing Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Upload & Processing */}
            <Card className={`${isProcessing ? 'border-primary shadow-glow' : ''} transition-all duration-smooth`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Face Verification Test</span>
                </CardTitle>
                <CardDescription>
                  Upload an image to test our ML verification pipeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isProcessing && !results && (
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-gradient-hero rounded-lg flex items-center justify-center mx-auto border-2 border-dashed border-border">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Upload Test Image</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a face image to test verification accuracy
                      </p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center space-y-4 scan-animation">
                    <div className="w-32 h-32 bg-primary rounded-lg flex items-center justify-center mx-auto">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Processing Image...</h3>
                      <p className="text-sm text-muted-foreground">
                        Running ML verification pipeline
                      </p>
                      <Progress value={progress} className="mt-3" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(progress)}% complete
                      </p>
                    </div>
                  </div>
                )}

                {results && (
                  <div className={`space-y-4 ${results.match ? 'verify-success' : ''}`}>
                    <div className="text-center space-y-2">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                        results.match ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                      }`}>
                        {results.match ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <AlertTriangle className="w-8 h-8" />
                        )}
                      </div>
                      <h3 className={`text-xl font-bold ${results.match ? 'text-success' : 'text-destructive'}`}>
                        {results.match ? "Verification Successful" : "Verification Failed"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Processed in {results.processingTime}s
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-lg font-bold text-foreground">
                          {(results.confidence * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-lg font-bold text-foreground">
                          {(results.livenessScore * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Liveness</p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setResults(null);
                        setProgress(0);
                      }}
                      className="w-full"
                    >
                      Test Another Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results & Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analysis Results</span>
                </CardTitle>
                <CardDescription>Detailed verification metrics and features</CardDescription>
              </CardHeader>
              <CardContent>
                {!results ? (
                  <div className="text-center space-y-4 py-8">
                    <Eye className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Upload an image to see analysis results</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Feature Detection */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Detected Features</h4>
                      <div className="space-y-2">
                        {Object.entries(results.detectedFeatures).map(([feature, detected]) => (
                          <div key={feature} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                            <Badge variant={detected ? "default" : "secondary"}>
                              {detected ? "✓" : "✗"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Embedding Preview */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Face Embedding (Preview)</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {results.embedding.map((value, index) => (
                          <div key={index} className="text-xs font-mono bg-muted p-2 rounded text-center">
                            {value}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Showing 8 of 512 dimensions
                      </p>
                    </div>

                    {/* Verification Threshold */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Similarity Threshold</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Score</span>
                          <span className={results.confidence >= 0.85 ? 'text-success' : 'text-destructive'}>
                            {(results.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={results.confidence * 100} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Threshold: 85%</span>
                          <span>{results.match ? "PASS" : "FAIL"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {modelSpecs.map((model, index) => (
              <Card key={index} className="hover:shadow-medium transition-all duration-smooth">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-scan rounded-full flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-white" />
                    </div>
                    <span>{model.name}</span>
                  </CardTitle>
                  <CardDescription>{model.purpose}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-success-light rounded-lg">
                      <p className="text-lg font-bold text-success">{model.accuracy}</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <p className="text-lg font-bold text-primary">{model.speed}</p>
                      <p className="text-xs text-muted-foreground">Processing</p>
                    </div>
                  </div>

                  <Badge variant="outline" className="w-full justify-center">
                    Production Ready
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>ML Processing Pipeline</span>
              </CardTitle>
              <CardDescription>Step-by-step verification workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Image Preprocessing",
                    description: "Resize, normalize, and enhance image quality",
                    icon: Camera,
                    color: "primary"
                  },
                  {
                    step: 2,
                    title: "Face Detection",
                    description: "Locate face region using RetinaFace/MTCNN",
                    icon: Eye,
                    color: "secondary"
                  },
                  {
                    step: 3,
                    title: "Liveness Detection",
                    description: "Anti-spoofing verification with texture analysis",
                    icon: Shield,
                    color: "success"
                  },
                  {
                    step: 4,
                    title: "Feature Extraction",
                    description: "Generate 512D embedding vector with ArcFace",
                    icon: Brain,
                    color: "warning"
                  },
                  {
                    step: 5,
                    title: "Similarity Matching",
                    description: "Cosine similarity comparison with threshold 0.85",
                    icon: Target,
                    color: "primary"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${item.color} text-${item.color}-foreground flex-shrink-0`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        Step {item.step}: {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <div className="flex items-start space-x-3">
                  <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Configuration Parameters</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Confidence Threshold: 0.85 (85%)</li>
                      <li>• Liveness Score Minimum: 0.80 (80%)</li>
                      <li>• Face Detection Confidence: 0.90 (90%)</li>
                      <li>• Processing Timeout: 10 seconds</li>
                      <li>• Maximum Image Size: 2048x2048</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}