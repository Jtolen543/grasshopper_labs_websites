"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle, AlertCircle, X, Search, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  name: string
  size: number
  type: string
  uploadedAt: string
  filename?: string
}

interface ParsedData {
  success: boolean
  filename: string
  analysis: {
    wordCount: number
    hasContactInfo: boolean
    hasPhoneNumber: boolean
    keywords: {
      skills: string[]
      experience: string[]
      education: string[]
      certifications: string[]
      languages: string[]
    }
    summary: {
      totalSkills: number
      totalExperience: number
      totalEducation: number
      totalCertifications: number
      totalLanguages: number
    }
  }
}

export function ResumeUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [showParsedData, setShowParsedData] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")
    setParsedData(null)
    setShowParsedData(false)

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const result = await response.json()

        // Add to uploaded files list
        const uploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          filename: result.filename,
        }

        setUploadedFiles((prev) => [...prev, uploadedFile])
      }

      setUploadStatus("success")
    } catch (error) {
      setUploadStatus("error")
      setErrorMessage("Failed to upload file. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const parseResume = async (filename: string) => {
    setIsParsing(true)
    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      })

      if (!response.ok) {
        throw new Error("Parsing failed")
      }

      const result = await response.json()
      setParsedData(result)
      setShowParsedData(true)
    } catch (error) {
      console.error("Parse error:", error)
      setErrorMessage("Failed to parse resume. Please try again.")
    } finally {
      setIsParsing(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    if (parsedData && uploadedFiles[index]?.filename === parsedData.filename) {
      setParsedData(null)
      setShowParsedData(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
          <CardDescription>
            Drag and drop your resume file or click to browse. Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              isUploading && "pointer-events-none opacity-50",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop your resume here...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isUploading ? "Uploading..." : "Drop your resume here, or click to select"}
                  </p>
                  <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, TXT up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus === "success" && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200">File uploaded successfully!</span>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200">{errorMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Your uploaded resume files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => file.filename && parseResume(file.filename)}
                      disabled={isParsing || !file.filename}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {isParsing ? (
                        <>
                          <Search className="h-4 w-4 mr-1 animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-1" />
                          Parse
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {parsedData && showParsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Resume Analysis</span>
            </CardTitle>
            <CardDescription>Extracted keywords and analysis from {parsedData.filename}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{parsedData.analysis.summary.totalSkills}</div>
                  <div className="text-sm text-muted-foreground">Skills</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{parsedData.analysis.summary.totalExperience}</div>
                  <div className="text-sm text-muted-foreground">Experience</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{parsedData.analysis.summary.totalEducation}</div>
                  <div className="text-sm text-muted-foreground">Education</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {parsedData.analysis.summary.totalCertifications}
                  </div>
                  <div className="text-sm text-muted-foreground">Certifications</div>
                </div>
                <div className="text-center p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">{parsedData.analysis.wordCount}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
              </div>

              {/* Keywords by Category */}
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(parsedData.analysis.keywords).map(
                  ([category, keywords]) =>
                    keywords.length > 0 && (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold capitalize text-foreground">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>

              {/* Contact Info Status */}
              <div className="flex space-x-4 text-sm">
                <div
                  className={`flex items-center space-x-1 ${parsedData.analysis.hasContactInfo ? "text-green-600" : "text-red-600"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${parsedData.analysis.hasContactInfo ? "bg-green-600" : "bg-red-600"}`}
                  />
                  <span>Email {parsedData.analysis.hasContactInfo ? "Found" : "Not Found"}</span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${parsedData.analysis.hasPhoneNumber ? "text-green-600" : "text-red-600"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${parsedData.analysis.hasPhoneNumber ? "bg-green-600" : "bg-red-600"}`}
                  />
                  <span>Phone {parsedData.analysis.hasPhoneNumber ? "Found" : "Not Found"}</span>
                </div>
              </div>

              {/* Raw JSON Data */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  View Raw JSON Data
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                  {JSON.stringify(parsedData, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

