"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data for charts
const lineData = [
  { name: "Jan", value: 400, value2: 240 },
  { name: "Feb", value: 300, value2: 139 },
  { name: "Mar", value: 200, value2: 980 },
  { name: "Apr", value: 278, value2: 390 },
  { name: "May", value: 189, value2: 480 },
  { name: "Jun", value: 239, value2: 380 },
]

const barData = [
  { name: "Mon", sales: 120, revenue: 240 },
  { name: "Tue", sales: 98, revenue: 210 },
  { name: "Wed", sales: 86, revenue: 180 },
  { name: "Thu", sales: 99, revenue: 220 },
  { name: "Fri", sales: 145, revenue: 290 },
  { name: "Sat", sales: 165, revenue: 330 },
  { name: "Sun", sales: 142, revenue: 284 },
]

const pieData = [
  { name: "Desktop", value: 400 },
  { name: "Mobile", value: 300 },
  { name: "Tablet", value: 200 },
  { name: "Other", value: 100 },
]

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState("line")

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="line">Line Chart</TabsTrigger>
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          <TabsTrigger value="area">Area Chart</TabsTrigger>
          <TabsTrigger value="pie">Pie Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="line" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Line Chart Example</CardTitle>
              <CardDescription>A simple line chart with two data series</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="value2" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bar Chart Example</CardTitle>
              <CardDescription>Weekly sales and revenue comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="area" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Area Chart Example</CardTitle>
              <CardDescription>Stacked area chart showing trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                  />
                  <Area
                    type="monotone"
                    dataKey="value2"
                    stackId="1"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pie" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pie Chart Example</CardTitle>
              <CardDescription>Device usage distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent  * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Experiment Area</CardTitle>
          <CardDescription>Add your custom charts below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
            <p className="text-muted-foreground">Your custom chart goes here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
