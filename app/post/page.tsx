"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Upload } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function PostItemPage() {
  const [date, setDate] = useState<Date>()
  const [itemType, setItemType] = useState<"lost" | "found">("found")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would handle the form submission, including uploading the image
    alert("Form submitted! In a real app, this would save your post.")
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Post an Item</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Provide details about the item you lost or found to help connect it with its owner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="item-type">Item Status</Label>
                <RadioGroup
                  defaultValue="found"
                  className="flex gap-4"
                  onValueChange={(value) => setItemType(value as "lost" | "found")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="found" id="found" />
                    <Label htmlFor="found">I found this item</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lost" id="lost" />
                    <Label htmlFor="lost">I lost this item</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Item Name</Label>
                <Input id="title" placeholder="e.g., Blue Backpack, Student ID Card" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about the item, any identifying features, contents, etc."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date {itemType === "lost" ? "Lost" : "Found"}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="library">University Library</SelectItem>
                      <SelectItem value="cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="dorms">Dormitories</SelectItem>
                      <SelectItem value="gym">Gymnasium</SelectItem>
                      <SelectItem value="science">Science Building</SelectItem>
                      <SelectItem value="arts">Arts Center</SelectItem>
                      <SelectItem value="student-center">Student Center</SelectItem>
                      <SelectItem value="other">Other (specify in description)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input type="file" id="image" accept="image/*" className="hidden" onChange={handleImageChange} />
                  {selectedImage ? (
                    <div className="mt-2">
                      <img
                        src={selectedImage || "/placeholder.svg"}
                        alt="Selected item"
                        className="max-h-48 mx-auto object-contain"
                      />
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => setSelectedImage(null)}>
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="cursor-pointer py-8" onClick={() => document.getElementById("image")?.click()}>
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (max. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

