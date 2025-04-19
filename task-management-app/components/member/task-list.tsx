"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Eye } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  progress: number
  dueDate: string
  feedback?: string
}

interface MemberTaskListProps {
  filter: "active" | "completed" | "all"
}

export default function MemberTaskList({ filter }: MemberTaskListProps) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [progress, setProgress] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [updating, setUpdating] = useState(false)

  const fetchTasks = async () => {
    if (!user) return

    setLoading(true)
    try {
      let q = query(collection(db, "tasks"), where("assignee", "==", user.uid), orderBy("createdAt", "desc"))

      if (filter === "active") {
        q = query(
          collection(db, "tasks"),
          where("assignee", "==", user.uid),
          where("status", "in", ["pending", "in-progress"]),
          orderBy("createdAt", "desc"),
        )
      } else if (filter === "completed") {
        q = query(
          collection(db, "tasks"),
          where("assignee", "==", user.uid),
          where("status", "==", "completed"),
          orderBy("createdAt", "desc"),
        )
      }

      const querySnapshot = await getDocs(q)
      const taskList: Task[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        taskList.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          progress: data.progress,
          dueDate: data.dueDate,
          feedback: data.feedback,
        })
      })

      setTasks(taskList)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [user, filter, fetchTasks])

  const handleUpdateProgress = async () => {
    if (!selectedTask) return

    setUpdating(true)
    try {
      const taskRef = doc(db, "tasks", selectedTask.id)

      // Determine if the task should be marked as completed
      let newStatus = selectedTask.status
      if (progress === 100 && selectedTask.status !== "completed") {
        newStatus = "completed"
      } else if (progress < 100 && selectedTask.status === "pending") {
        newStatus = "in-progress"
      }

      await updateDoc(taskRef, {
        progress,
        status: newStatus,
        feedback,
      })

      fetchTasks()
      setSelectedTask(null)
    } catch (error) {
      console.error("Error updating task:", error)
    } finally {
      setUpdating(false)
    }
  }

  const openTaskDialog = (task: Task) => {
    setSelectedTask(task)
    setProgress(task.progress)
    setFeedback(task.feedback || "")
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in-progress":
        return "default"
      case "completed":
        return "default"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading tasks...</div>
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(task.status)}>{task.status.replace("-", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{task.progress}%</span>
                  </TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openTaskDialog(task)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>{selectedTask?.title}</DialogTitle>
                        </DialogHeader>

                        {selectedTask && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium">Description</h4>
                              <p className="mt-1 text-sm text-gray-500">
                                {selectedTask.description || "No description provided."}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium">Status</h4>
                              <Badge className="mt-1" variant={getStatusBadgeVariant(selectedTask.status)}>
                                {selectedTask.status.replace("-", " ")}
                              </Badge>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium">Due Date</h4>
                              <p className="mt-1 text-sm text-gray-500">
                                {new Date(selectedTask.dueDate).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="progress">Progress</Label>
                                <span className="text-sm">{progress}%</span>
                              </div>
                              <Slider
                                id="progress"
                                min={0}
                                max={100}
                                step={5}
                                value={[progress]}
                                onValueChange={(value) => setProgress(value[0])}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="feedback">Feedback / Notes</Label>
                              <Textarea
                                id="feedback"
                                placeholder="Add your comments or feedback here..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={4}
                              />
                            </div>
                          </div>
                        )}

                        <DialogFooter>
                          <Button onClick={handleUpdateProgress} disabled={updating}>
                            {updating ? "Updating..." : "Update Progress"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

