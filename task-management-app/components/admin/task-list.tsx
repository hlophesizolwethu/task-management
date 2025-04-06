"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import EditTaskForm from "./edit-task-form"

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  assigneeName: string
  status: "pending" | "in-progress" | "completed"
  progress: number
  dueDate: string
  createdAt: any
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const taskList: Task[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        taskList.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          assignee: data.assignee,
          assigneeName: data.assigneeName,
          status: data.status,
          progress: data.progress,
          dueDate: data.dueDate,
          createdAt: data.createdAt,
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
  }, [])

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteDoc(doc(db, "tasks", taskId))
        setTasks(tasks.filter((task) => task.id !== taskId))
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in-progress":
        return "default"
      case "completed":
        return "success"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading tasks...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No tasks found
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.assigneeName}</TableCell>
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
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setEditingTask(task)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        {editingTask && (
                          <EditTaskForm
                            task={editingTask}
                            onSuccess={() => {
                              fetchTasks()
                              setEditingTask(null)
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

