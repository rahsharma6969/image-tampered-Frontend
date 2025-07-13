import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Camera,
  Zap,
  TrendingUp,
  Eye,
  Upload,
  X,
  Loader2,
  Monitor,
  Info,
} from "lucide-react";

const ForgeryDetectionDashboard = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  // const apiUrl = "http://localhost:5000";
  const API_URL = import.meta.env.VITE_API_URL;
  // Enhanced score interpretation function
  const getScoreInterpretation = (score) => {
    const numScore = parseFloat(score);

    if (numScore >= 0 && numScore <= 20) {
      return {
        level: "AUTHENTIC",
        color: "green",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/50",
        textColor: "text-green-400",
        icon: <CheckCircle className="w-6 h-6" />,
        description:
          "Document appears to be genuine with no signs of tampering",
        confidence: "Very High",
        recommendation: "Document can be trusted for official purposes",
      };
    } else if (numScore > 20 && numScore <= 40) {
      return {
        level: "LIKELY AUTHENTIC",
        color: "blue",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/50",
        textColor: "text-blue-400",
        icon: <CheckCircle className="w-6 h-6" />,
        description:
          "Document shows minimal signs of manipulation, likely authentic",
        confidence: "High",
        recommendation:
          "Document appears trustworthy but consider additional verification",
      };
    } else if (numScore > 40 && numScore <= 60) {
      return {
        level: "INCONCLUSIVE",
        color: "yellow",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500/50",
        textColor: "text-yellow-400",
        icon: <AlertTriangle className="w-6 h-6" />,
        description:
          "Document shows some anomalies that require further investigation",
        confidence: "Medium",
        recommendation:
          "Manual verification recommended before accepting document",
      };
    } else if (numScore > 60 && numScore <= 80) {
      return {
        level: "SUSPICIOUS",
        color: "orange",
        bgColor: "bg-orange-500/20",
        borderColor: "border-orange-500/50",
        textColor: "text-orange-400",
        icon: <AlertTriangle className="w-6 h-6" />,
        description: "Document likely contains manipulated content or forgery",
        confidence: "High",
        recommendation:
          "Document should be rejected or thoroughly investigated",
      };
    } else {
      return {
        level: "HIGHLY SUSPICIOUS",
        color: "red",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/50",
        textColor: "text-red-400",
        icon: <Shield className="w-6 h-6" />,
        description:
          "Document shows clear signs of significant tampering or forgery",
        confidence: "Very High",
        recommendation: "Document should be rejected immediately",
      };
    }
  };

  // Score range visualization component
  const ScoreRangeGuide = () => (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Info className="w-6 h-6 text-blue-400 mr-2" />
        Forgery Score Interpretation Guide
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            range: "0-20",
            level: "AUTHENTIC",
            color: "green",
            description: "No signs of tampering",
          },
          {
            range: "21-40",
            level: "LIKELY AUTHENTIC",
            color: "blue",
            description: "Minimal anomalies detected",
          },
          {
            range: "41-60",
            level: "INCONCLUSIVE",
            color: "yellow",
            description: "Requires further investigation",
          },
          {
            range: "61-80",
            level: "SUSPICIOUS",
            color: "orange",
            description: "Likely contains forgery",
          },
          {
            range: "81-100",
            level: "HIGHLY SUSPICIOUS",
            color: "red",
            description: "Clear signs of tampering",
          },
        ].map((item, index) => (
          <div
            key={index}
            className={`bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-lg p-4`}
          >
            <div className="flex items-center mb-2">
              <div
                className={`w-3 h-3 rounded-full bg-${item.color}-500 mr-2`}
              ></div>
              <span className={`text-${item.color}-400 font-semibold text-sm`}>
                {item.range}
              </span>
            </div>
            <div className={`text-${item.color}-300 font-medium mb-1`}>
              {item.level}
            </div>
            <div className="text-gray-400 text-xs">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleFileSelect = (file) => {
    if (file) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/bmp",
        "image/tiff",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Unsupported file type. Please upload an image (PNG, JPG, GIF, BMP, TIFF) or PDF."
        );
        return;
      }
      if (file.size > 16 * 1024 * 1024) {
        setError("File too large. Maximum size is 16MB.");
        return;
      }
      setSelectedFile(file);
      setError(null);

      if (file.type !== "application/pdf") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setOriginalImageUrl(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setOriginalImageUrl(null);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch(`${API_URL}/detect`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError(err.message || "Failed to analyze file");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisData(null);
    setSelectedFile(null);
    setOriginalImageUrl(null);
    setError(null);
    setShowDetails(false);
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "CLEAN":
        return "text-green-400";
      case "SUSPICIOUS":
        return "text-yellow-400";
      case "FORGED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case "CLEAN":
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case "SUSPICIOUS":
        return <AlertTriangle className="w-8 h-8 text-yellow-400" />;
      case "FORGED":
        return <Shield className="w-8 h-8 text-red-400" />;
      default:
        return <FileText className="w-8 h-8 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (typeof timestamp === "string") {
      return timestamp;
    }
    if (typeof timestamp === "object" && timestamp !== null) {
      return JSON.stringify(timestamp, null, 2);
    }
    return "N/A";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">ForgeGuard AI</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Advanced Document Authenticity Detection
          </p>
        </div>

        {/* Score Range Guide */}
        <ScoreRangeGuide />

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        {!analysisData && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? "border-purple-400 bg-purple-900/20"
                  : "border-gray-600 hover:border-gray-500"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={handleFileInput}
                accept="image/*,.pdf"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {selectedFile
                    ? selectedFile.name
                    : "Upload Document for Analysis"}
                </h3>
                <p className="text-gray-400 mb-4">
                  Drag and drop or click to select an image or PDF file
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: PNG, JPG, GIF, BMP, TIFF, PDF (Max 16MB)
                </p>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">{selectedFile.name}</span>
                  <span className="text-gray-400 ml-2">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={resetAnalysis}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </button>
                  <button
                    onClick={analyzeFile}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 py-2 rounded transition-colors flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Analyze Document
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Analyzing Document...
              </h3>
              <p className="text-gray-400">
                Please wait while we process your document
              </p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisData && (
          <>
            {/* Enhanced Main Result Card */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-purple-500/20 shadow-2xl">
              {(() => {
                const interpretation = getScoreInterpretation(
                  analysisData.summary.avg_score
                );
                return (
                  <>
                    {/* Score-based Judgment Section */}
                    <div
                      className={`${interpretation.bgColor} ${interpretation.borderColor} border-2 rounded-2xl p-6 mb-6`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={interpretation.textColor}>
                            {interpretation.icon}
                          </div>
                          <div className="ml-4">
                            <h2
                              className={`text-3xl font-bold ${interpretation.textColor}`}
                            >
                              {interpretation.level}
                            </h2>
                            <p className="text-gray-400">Document Assessment</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-white">
                            {analysisData.summary.avg_score}
                          </div>
                          <p className="text-gray-400">Forgery Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-white mb-2">
                            Analysis
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {interpretation.description}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">
                            Recommendation
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {interpretation.recommendation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">
                            Confidence Level:
                          </span>
                          <span
                            className={`font-semibold ${interpretation.textColor}`}
                          >
                            {interpretation.confidence}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">
                            System Verdict:
                          </span>
                          <span
                            className={getVerdictColor(
                              analysisData.summary.verdict
                            )}
                          >
                            {analysisData.summary.verdict}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Authenticity Confidence</span>
                        <span>
                          {(
                            100 - parseFloat(analysisData.summary.avg_score)
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-4 relative">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-2000 ease-out"
                          style={{
                            width: `${
                              100 - parseFloat(analysisData.summary.avg_score)
                            }%`,
                          }}
                        ></div>
                        {/* Score markers */}
                        <div className="absolute top-0 left-0 w-full h-full flex">
                          {[20, 40, 60, 80].map((mark) => (
                            <div
                              key={mark}
                              className="absolute border-l-2 border-gray-300 h-4 opacity-50"
                              style={{ left: `${100 - mark}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Authentic</span>
                        <span>Suspicious</span>
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-gray-300">Max Score</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {analysisData.summary.max_score}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-purple-400 mr-2" />
                    <span className="text-gray-300">Pages Analyzed</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {analysisData.pages_analyzed}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-gray-300">Threshold</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {analysisData.summary.suspicious_threshold}
                  </div>
                </div>
              </div>

              {/* New File Button */}
              <div className="text-center">
                <button
                  onClick={resetAnalysis}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Analyze Another Document
                </button>
              </div>
            </div>

            {/* Image Comparison Section */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Monitor className="w-6 h-6 text-green-400 mr-2" />
                Image Analysis Results
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Document */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Camera className="w-5 h-5 text-blue-400 mr-2" />
                    Original Document
                  </h4>
                  {selectedFile && selectedFile.type === "application/pdf" ? (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                      <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">
                        {selectedFile.name}
                      </p>
                      <p className="text-gray-400 text-sm">PDF Document</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : originalImageUrl ? (
                    <div className="relative">
                      <img
                        src={originalImageUrl}
                        alt="Original uploaded image"
                        className="w-full h-auto rounded-lg border border-gray-600 shadow-lg"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        Uploaded Image
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No document selected</p>
                    </div>
                  )}
                </div>

                {/* Tampered Region Visualization */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-red-400 mr-2" />
                    Analysis Results
                  </h4>
                  {analysisData.result_images &&
                  analysisData.result_images.length > 0 ? (
                    <div className="space-y-4">
                      {analysisData.result_images.map((resultImage, index) => (
                        <div key={index} className="space-y-4">
                          {/* <div className="relative">
                            <img
                              src={`${apiUrl}/${resultImage.original}`}
                              alt={`Original Page ${resultImage.page}`}
                              className="w-full h-auto rounded-lg border border-gray-600 shadow-lg"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              Original - Page {resultImage.page}
                            </div>
                          </div> */}

                          <div className="relative">
                            <img
                              src={`${API_URL}/${resultImage.overlay}`}
                              alt={`Overlay Page ${resultImage.page}`}
                              className="w-full h-auto rounded-lg border border-gray-600 shadow-lg"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              Overlay (Tampered Regions)
                            </div>
                          </div>

                          <div className="relative">
                            <img
                              src={`${API_URL}/${resultImage.heatmap}`}
                              alt={`Heatmap Page ${resultImage.page}`}
                              className="w-full h-auto rounded-lg border border-gray-600 shadow-lg"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              Heatmap Output
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <p className="text-gray-400">
                        No analysis results available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Technical Details */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Zap className="w-6 h-6 text-yellow-400 mr-2" />
                  Processing Details
                </h3>
                <div className="space-y-4">
                  {analysisData.processing_info[0] && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Total Pixels</span>
                        <span className="text-white font-mono">
                          {analysisData.processing_info[0].total_pixels.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Mask Pixels</span>
                        <span className="text-white font-mono">
                          {analysisData.processing_info[0].mask_pixels.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Original Shape</span>
                        <span className="text-white font-mono">
                          {analysisData.processing_info[0].original_shape.join(
                            "×"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">Tensor Shape</span>
                        <span className="text-white font-mono">
                          {analysisData.processing_info[0].tensor_shape.join(
                            "×"
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Image Information */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Camera className="w-6 h-6 text-blue-400 mr-2" />
                  Image Information
                </h3>
                <div className="space-y-4">
                  {analysisData.timestamps.image_info && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Format</span>
                        <span className="text-white font-mono">
                          {analysisData.timestamps.image_info.format}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Mode</span>
                        <span className="text-white font-mono">
                          {analysisData.timestamps.image_info.mode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Size</span>
                        <span className="text-white font-mono">
                          {analysisData.timestamps.image_info.size}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">EXIF Data</span>
                    <span className="text-gray-400 italic">
                      {formatTimestamp(analysisData.timestamps.EXIF)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Analysis Toggle */}
            <div className="mt-8">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                {showDetails ? "Hide" : "Show"} Advanced Analysis
              </button>
            </div>

            {/* Advanced Details */}
            {showDetails && (
              <div className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4">
                  Advanced Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">
                      Output Range
                    </h4>
                    <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm text-gray-300">
                      {analysisData.processing_info[0] && (
                        <>
                          <div>
                            Min:{" "}
                            {analysisData.processing_info[0].output_range[0].toExponential(
                              3
                            )}
                          </div>
                          <div>
                            Max:{" "}
                            {analysisData.processing_info[0].output_range[1].toFixed(
                              6
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">
                      Tensor Range
                    </h4>
                    <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm text-gray-300">
                      {analysisData.processing_info[0] && (
                        <>
                          <div>
                            Min:{" "}
                            {analysisData.processing_info[0].tensor_range[0]}
                          </div>
                          <div>
                            Max:{" "}
                            {analysisData.processing_info[0].tensor_range[1]}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-purple-400 mb-3">
                    Preprocessing Note
                  </h4>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-gray-300">
                    {analysisData.preprocessing_note}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>Processed on {analysisData.timestamps.upload_time}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgeryDetectionDashboard;
