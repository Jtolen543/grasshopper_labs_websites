"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Edit2, Save, X } from "lucide-react"
import type { Resume } from "@/app/api/parse/resumeSchema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ResumeVerificationProps {
  parsedData: Resume
  onConfirm: (data: Resume) => void
  onCancel: () => void
  open: boolean
}

export function ResumeVerification({ parsedData, onConfirm, onCancel, open }: ResumeVerificationProps) {
  const [editedData, setEditedData] = useState<Resume>(parsedData)
  const [isEditing, setIsEditing] = useState(false)

  const handleBasicsChange = (field: string, value: string) => {
    setEditedData({
      ...editedData,
      basics: {
        ...editedData.basics,
        [field]: value,
      },
    })
  }

  const handleLocationChange = (field: string, value: string) => {
    setEditedData({
      ...editedData,
      basics: {
        ...editedData.basics,
        location: {
          ...editedData.basics.location,
          [field]: value,
        },
      },
    })
  }

  const handleEducationChange = (index: number, field: string, value: string | number) => {
    const newEducation = [...editedData.education]
    newEducation[index] = {
      ...newEducation[index],
      [field]: value,
    }
    setEditedData({
      ...editedData,
      education: newEducation,
    })
  }

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const newExperience = [...editedData.experience]
    newExperience[index] = {
      ...newExperience[index],
      [field]: value,
    }
    setEditedData({
      ...editedData,
      experience: newExperience,
    })
  }

  const handleProjectChange = (index: number, field: string, value: string | string[]) => {
    const newProjects = [...editedData.projects]
    newProjects[index] = {
      ...newProjects[index],
      [field]: value,
    }
    setEditedData({
      ...editedData,
      projects: newProjects,
    })
  }

  const addExperience = () => {
    setEditedData({
      ...editedData,
      experience: [
        ...editedData.experience,
        {
          company: "",
          position: "",
          start_date: "",
          end_date: "",
          location: "",
          responsibilities: [],
          achievements: [],
          technologies: [],
        },
      ],
    })
  }

  const removeExperience = (index: number) => {
    setEditedData({
      ...editedData,
      experience: editedData.experience.filter((_, idx) => idx !== index),
    })
  }

  const addProject = () => {
    setEditedData({
      ...editedData,
      projects: [
        ...editedData.projects,
        {
          name: "",
          description: "",
          technologies: [],
          highlights: [],
          link: "",
          github: "",
        },
      ],
    })
  }

  const removeProject = (index: number) => {
    setEditedData({
      ...editedData,
      projects: editedData.projects.filter((_, idx) => idx !== index),
    })
  }

  const handleConfirm = () => {
    onConfirm(editedData)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Verify Your Resume Data
          </DialogTitle>
          <DialogDescription>
            Please review and confirm the extracted information is correct
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
        {/* Basic Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-base">Basic Information</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? "Done Editing" : "Edit"}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.basics.name}
                  onChange={(e) => handleBasicsChange("name", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-1">{editedData.basics.name}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData.basics.email}
                  onChange={(e) => handleBasicsChange("email", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-1">{editedData.basics.email}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedData.basics.phone}
                  onChange={(e) => handleBasicsChange("phone", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-1">{editedData.basics.phone}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              {isEditing ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="City"
                    value={editedData.basics.location.city}
                    onChange={(e) => handleLocationChange("city", e.target.value)}
                    className="w-1/2 px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={editedData.basics.location.state}
                    onChange={(e) => handleLocationChange("state", e.target.value)}
                    className="w-1/2 px-3 py-2 border rounded-md"
                  />
                </div>
              ) : (
                <p className="mt-1">
                  {editedData.basics.location.city}, {editedData.basics.location.state}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.basics.linkedin}
                  onChange={(e) => handleBasicsChange("linkedin", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-1">{editedData.basics.linkedin || "N/A"}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">GitHub</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.basics.github}
                  onChange={(e) => handleBasicsChange("github", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-1">{editedData.basics.github || "N/A"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Education */}
        {editedData.education && editedData.education.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-base border-b pb-2">Education</h4>
            {editedData.education.map((edu, idx) => (
              <div key={idx} className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">School</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleEducationChange(idx, "school", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{edu.school}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Degree</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={`${edu.degree} in ${edu.field}`}
                        onChange={(e) => {
                          const parts = e.target.value.split(" in ")
                          handleEducationChange(idx, "degree", parts[0])
                          handleEducationChange(idx, "field", parts[1] || "")
                        }}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <p className="mt-1">{edu.degree} in {edu.field}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dates</label>
                    <p className="mt-1 text-sm">{edu.start_date} - {edu.end_date}</p>
                  </div>
                  
                  {edu.gpa > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">GPA</label>
                      <p className="mt-1 text-sm">{edu.gpa.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {(editedData.experience && editedData.experience.length > 0) || isEditing ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-semibold text-base">Work Experience</h4>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                  className="text-xs"
                >
                  + Add Experience
                </Button>
              )}
            </div>
            {editedData.experience.map((exp, idx) => (
              <div key={idx} className="bg-muted/30 p-4 rounded-lg space-y-3 relative">
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeExperience(idx)}
                    className="absolute top-2 right-2 text-xs"
                  >
                    Remove
                  </Button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{exp.company}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => handleExperienceChange(idx, "position", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <p className="mt-1">{exp.position}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={exp.start_date}
                        onChange={(e) => handleExperienceChange(idx, "start_date", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="e.g. Jan 2023"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{exp.start_date}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={exp.end_date}
                        onChange={(e) => handleExperienceChange(idx, "end_date", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="e.g. Present"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{exp.end_date}</p>
                    )}
                  </div>
                  
                  {isEditing && exp.location && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleExperienceChange(idx, "location", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Skills */}
        {editedData.skills && (
          <div className="space-y-3">
            <h4 className="font-semibold text-base border-b pb-2">Skills</h4>
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              {editedData.skills.programming_languages && editedData.skills.programming_languages.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Programming Languages</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editedData.skills.programming_languages.map((lang, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {editedData.skills.frameworks && editedData.skills.frameworks.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Frameworks</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editedData.skills.frameworks.map((fw, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {fw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {editedData.skills.libraries && editedData.skills.libraries.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Libraries</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editedData.skills.libraries.map((lib, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {lib}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {editedData.skills.databases && editedData.skills.databases.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Databases</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editedData.skills.databases.map((db, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {db}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {editedData.skills.devops_tools && editedData.skills.devops_tools.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">DevOps Tools</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editedData.skills.devops_tools.map((tool, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {editedData.skills.cloud_platforms && editedData.skills.cloud_platforms.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cloud Platforms</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editedData.skills.cloud_platforms.map((cloud, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cloud}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {editedData.skills.other && editedData.skills.other.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Other Skills</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editedData.skills.other.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {(editedData.projects && editedData.projects.length > 0) || isEditing ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-semibold text-base">Projects</h4>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProject}
                  className="text-xs"
                >
                  + Add Project
                </Button>
              )}
            </div>
            {editedData.projects.map((project, idx) => (
              <div key={idx} className="bg-muted/30 p-4 rounded-lg space-y-3 relative">
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProject(idx)}
                    className="absolute top-2 right-2 text-xs"
                  >
                    Remove
                  </Button>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{project.name}</p>
                  )}
                </div>
                
                {isEditing && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      rows={2}
                      placeholder="Brief description of the project"
                    />
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tech Stack</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={project.technologies.join(", ")}
                      onChange={(e) => {
                        const techs = e.target.value.split(",").map(t => t.trim()).filter(t => t)
                        handleProjectChange(idx, "technologies", techs)
                      }}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="React, Node.js, MongoDB (comma-separated)"
                    />
                  ) : (
                    project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.technologies.map((tech, techIdx) => (
                          <Badge key={techIdx} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )
                  )}
                </div>
                
                {isEditing && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">GitHub Link</label>
                      <input
                        type="text"
                        value={project.github}
                        onChange={(e) => handleProjectChange(idx, "github", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="github.com/username/project"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Project Link</label>
                      <input
                        type="text"
                        value={project.link}
                        onChange={(e) => handleProjectChange(idx, "link", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="project-website.com"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {/* Achievements */}
        {editedData.achievements && editedData.achievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-base border-b pb-2">Achievements</h4>
            {editedData.achievements.map((achievement, idx) => (
              <div key={idx} className="bg-muted/30 p-4 rounded-lg space-y-2">
                <p className="font-medium">{achievement.title}</p>
                {achievement.issuer && <p className="text-sm text-muted-foreground">{achievement.issuer}</p>}
                {achievement.date && <p className="text-xs text-muted-foreground">{achievement.date}</p>}
                {achievement.description && <p className="text-sm mt-2">{achievement.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {editedData.certifications && editedData.certifications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-base border-b pb-2">Certifications</h4>
            {editedData.certifications.map((cert, idx) => (
              <div key={idx} className="bg-muted/30 p-4 rounded-lg space-y-2">
                <p className="font-medium">{cert.name}</p>
                {cert.issuer && <p className="text-sm text-muted-foreground">{cert.issuer}</p>}
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {cert.date && <span>{cert.date}</span>}
                  {cert.credential_id && <span>• ID: {cert.credential_id}</span>}
                </div>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    View Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Publications */}
        {editedData.publications && editedData.publications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-base border-b pb-2">Publications</h4>
            {editedData.publications.map((pub, idx) => (
              <div key={idx} className="bg-muted/30 p-4 rounded-lg space-y-2">
                <p className="font-medium">{pub.title}</p>
                {pub.publisher && <p className="text-sm text-muted-foreground">{pub.publisher}</p>}
                {pub.date && <p className="text-xs text-muted-foreground">{pub.date}</p>}
                {pub.summary && <p className="text-sm mt-2">{pub.summary}</p>}
                {pub.url && (
                  <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    View Publication
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Extracurriculars */}
        {editedData.extracurriculars && editedData.extracurriculars.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-base border-b pb-2">Extracurricular Activities</h4>
            {editedData.extracurriculars.map((activity, idx) => (
              <div key={idx} className="bg-muted/30 p-4 rounded-lg space-y-2">
                <p className="font-medium">{activity.organization}</p>
                <p className="text-sm text-muted-foreground">{activity.role}</p>
                <p className="text-xs text-muted-foreground">{activity.start_date} - {activity.end_date}</p>
                {activity.achievements && activity.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {activity.achievements.map((achievement, achIdx) => (
                      <li key={achIdx}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleConfirm} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Confirm & Continue
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
