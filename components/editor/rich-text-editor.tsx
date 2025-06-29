"use client"

import type React from "react"

import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    LinkIcon,
    ImageIcon,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Palette,
    Undo,
    Redo,
    Type,
    Quote,
    Minus,
    Unlink,
} from "lucide-react"

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    label?: string
    placeholder?: string
    height?: number
    className?: string
    required?: boolean
    error?: string
}

interface EditorRef {
    focus: () => void
    blur: () => void
    getContent: () => string
    setContent: (content: string) => void
}

interface FormatState {
    bold: boolean
    italic: boolean
    underline: boolean
    strikethrough: boolean
    justifyLeft: boolean
    justifyCenter: boolean
    justifyRight: boolean
    justifyFull: boolean
    insertOrderedList: boolean
    insertUnorderedList: boolean
    fontSize: string
    fontFamily: string
    foreColor: string
}

export const RichTextEditor = forwardRef<EditorRef, RichTextEditorProps>(
    (
        {
            value,
            onChange,
            label,
            placeholder = "Start writing your content...",
            height = 400,
            className,
            required = false,
            error,
        },
        ref,
    ) => {
        const editorRef = useRef<HTMLDivElement>(null)
        const [isEditorReady, setIsEditorReady] = useState(false)
        const [formatState, setFormatState] = useState<FormatState>({
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            justifyLeft: true,
            justifyCenter: false,
            justifyRight: false,
            justifyFull: false,
            insertOrderedList: false,
            insertUnorderedList: false,
            fontSize: "14px",
            fontFamily: "Arial",
            foreColor: "#000000",
        })
        const [showLinkDialog, setShowLinkDialog] = useState(false)
        const [linkUrl, setLinkUrl] = useState("")
        const [linkText, setLinkText] = useState("")
        const [selectedText, setSelectedText] = useState("")
        const [savedSelection, setSavedSelection] = useState<Range | null>(null)
        const [showColorPicker, setShowColorPicker] = useState(false)
        const [showFontSizeMenu, setShowFontSizeMenu] = useState(false)
        const [showFontFamilyMenu, setShowFontFamilyMenu] = useState(false)

        useImperativeHandle(ref, () => ({
            focus: () => {
                if (editorRef.current) {
                    editorRef.current.focus()
                }
            },
            blur: () => {
                if (editorRef.current) {
                    editorRef.current.blur()
                }
            },
            getContent: () => {
                return editorRef.current?.innerHTML || ""
            },
            setContent: (content: string) => {
                if (editorRef.current) {
                    editorRef.current.innerHTML = content
                }
            },
        }))

        useEffect(() => {
            if (editorRef.current && value !== editorRef.current.innerHTML) {
                editorRef.current.innerHTML = value
            }
            setIsEditorReady(true)
        }, [value])

        const saveSelection = useCallback(() => {
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
                setSavedSelection(selection.getRangeAt(0).cloneRange())
            }
        }, [])

        const restoreSelection = useCallback(() => {
            if (savedSelection) {
                const selection = window.getSelection()
                if (selection) {
                    selection.removeAllRanges()
                    selection.addRange(savedSelection)
                }
            }
        }, [savedSelection])

        const updateFormatState = useCallback(() => {
            if (!editorRef.current) return

            try {
                const newState: FormatState = {
                    bold: document.queryCommandState("bold"),
                    italic: document.queryCommandState("italic"),
                    underline: document.queryCommandState("underline"),
                    strikethrough: document.queryCommandState("strikeThrough"),
                    justifyLeft: document.queryCommandState("justifyLeft"),
                    justifyCenter: document.queryCommandState("justifyCenter"),
                    justifyRight: document.queryCommandState("justifyRight"),
                    justifyFull: document.queryCommandState("justifyFull"),
                    insertOrderedList: document.queryCommandState("insertOrderedList"),
                    insertUnorderedList: document.queryCommandState("insertUnorderedList"),
                    fontSize: document.queryCommandValue("fontSize") || "3",
                    fontFamily: document.queryCommandValue("fontName") || "Arial",
                    foreColor: document.queryCommandValue("foreColor") || "#000000",
                }
                setFormatState(newState)
            } catch (error) {
                console.warn("Error updating format state:", error)
            }
        }, [])

        const handleEditorChange = useCallback(() => {
            if (editorRef.current) {
                const content = editorRef.current.innerHTML
                onChange(content)
                updateFormatState()
            }
        }, [onChange, updateFormatState])

        const handleSelectionChange = useCallback(() => {
            updateFormatState()
            const selection = window.getSelection()
            if (selection && selection.toString().trim()) {
                setSelectedText(selection.toString().trim())
            } else {
                setSelectedText("")
            }
        }, [updateFormatState])

        useEffect(() => {
            document.addEventListener("selectionchange", handleSelectionChange)
            return () => document.removeEventListener("selectionchange", handleSelectionChange)
        }, [handleSelectionChange])

        const execCommand = useCallback(
            (command: string, value?: string) => {
                if (!editorRef.current) return

                editorRef.current.focus()
                try {
                    document.execCommand(command, false, value)
                    handleEditorChange()
                } catch (error) {
                    console.warn(`Error executing command ${command}:`, error)
                }
            },
            [handleEditorChange],
        )

        const insertLink = useCallback(() => {
            const selection = window.getSelection()
            if (!selection || selection.toString().trim() === "") {
                alert("Please select text first to create a link")
                return
            }

            saveSelection()
            setSelectedText(selection.toString().trim())
            setLinkText(selection.toString().trim())
            setLinkUrl("")
            setShowLinkDialog(true)
        }, [saveSelection])

        const removeLink = useCallback(() => {
            execCommand("unlink")
        }, [execCommand])

        const applyLink = useCallback(() => {
            if (!linkUrl.trim()) {
                alert("Please enter a valid URL")
                return
            }

            restoreSelection()

            if (editorRef.current) {
                editorRef.current.focus()

                // If we have selected text, create a link
                if (savedSelection && !savedSelection.collapsed) {
                    // Create the link element
                    const link = document.createElement("a")
                    link.href = linkUrl
                    link.target = "_blank"
                    link.rel = "noopener noreferrer"
                    link.textContent = linkText || selectedText

                    try {
                        savedSelection.deleteContents()
                        savedSelection.insertNode(link)

                        // Clear selection and move cursor after the link
                        const selection = window.getSelection()
                        if (selection) {
                            selection.removeAllRanges()
                            const range = document.createRange()
                            range.setStartAfter(link)
                            range.collapse(true)
                            selection.addRange(range)
                        }
                    } catch (error) {
                        console.warn("Error inserting link:", error)
                        // Fallback to execCommand
                        execCommand("createLink", linkUrl)
                    }
                } else {
                    // No selection, insert new link with text
                    const linkElement = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`
                    execCommand("insertHTML", linkElement)
                }

                handleEditorChange()
            }

            setShowLinkDialog(false)
            setLinkUrl("")
            setLinkText("")
            setSavedSelection(null)
        }, [linkUrl, linkText, selectedText, savedSelection, restoreSelection, execCommand, handleEditorChange])

        const insertImage = useCallback(() => {
            const url = prompt("Enter image URL:")
            if (url) {
                execCommand("insertImage", url)
            }
        }, [execCommand])

        const handlePaste = useCallback(
            (e: React.ClipboardEvent) => {
                e.preventDefault()

                const clipboardData = e.clipboardData
                const htmlData = clipboardData.getData("text/html")
                const textData = clipboardData.getData("text/plain")

                if (htmlData) {
                    // Clean the HTML to remove potentially harmful content while preserving formatting
                    const cleanHtml = cleanPastedHtml(htmlData)
                    execCommand("insertHTML", cleanHtml)
                } else if (textData) {
                    // Insert plain text
                    execCommand("insertText", textData)
                }
            },
            [execCommand],
        )

        const cleanPastedHtml = (html: string): string => {
            // Create a temporary div to parse the HTML
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = html

            // Remove script tags and other potentially harmful elements
            const scriptsAndObjects = tempDiv.querySelectorAll("script, object, embed, iframe, form, input, button")
            scriptsAndObjects.forEach((el) => el.remove())

            // Clean attributes but preserve formatting ones
            const allowedAttributes = [
                "style",
                "class",
                "href",
                "src",
                "alt",
                "title",
                "target",
                "rel",
                "colspan",
                "rowspan",
                "width",
                "height",
            ]

            const walkNodes = (node: Node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element
                    const attributesToRemove: string[] = []

                    for (let i = 0; i < element.attributes.length; i++) {
                        const attr = element.attributes[i]
                        if (!allowedAttributes.includes(attr.name.toLowerCase())) {
                            attributesToRemove.push(attr.name)
                        }
                    }

                    attributesToRemove.forEach((attrName) => {
                        element.removeAttribute(attrName)
                    })

                    // Ensure links have proper attributes
                    if (element.tagName.toLowerCase() === "a" && element.getAttribute("href")) {
                        element.setAttribute("target", "_blank")
                        element.setAttribute("rel", "noopener noreferrer")
                    }
                }

                // Recursively clean child nodes
                const children = Array.from(node.childNodes)
                children.forEach((child) => walkNodes(child))
            }

            walkNodes(tempDiv)
            return tempDiv.innerHTML
        }

        const handleEditorClick = useCallback((e: React.MouseEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName.toLowerCase() === "a") {
                e.preventDefault()
                const href = target.getAttribute("href")
                if (href) {
                    window.open(href, "_blank", "noopener,noreferrer")
                }
            }
        }, [])

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                // Handle keyboard shortcuts
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key.toLowerCase()) {
                        case "b":
                            e.preventDefault()
                            execCommand("bold")
                            break
                        case "i":
                            e.preventDefault()
                            execCommand("italic")
                            break
                        case "u":
                            e.preventDefault()
                            execCommand("underline")
                            break
                        case "k":
                            e.preventDefault()
                            insertLink()
                            break
                        case "z":
                            e.preventDefault()
                            if (e.shiftKey) {
                                execCommand("redo")
                            } else {
                                execCommand("undo")
                            }
                            break
                    }
                }

                // Handle Enter key for better list behavior
                if (e.key === "Enter") {
                    const selection = window.getSelection()
                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0)
                        const listItem = range.startContainer.parentElement?.closest("li")
                        if (listItem && listItem.textContent?.trim() === "") {
                            e.preventDefault()
                            execCommand("outdent")
                        }
                    }
                }
            },
            [execCommand, insertLink],
        )

        const colors = [
            "#000000",
            "#333333",
            "#666666",
            "#999999",
            "#cccccc",
            "#ffffff",
            "#ff0000",
            "#ff6600",
            "#ffcc00",
            "#33cc00",
            "#0066cc",
            "#6600cc",
            "#ff3366",
            "#ff9933",
            "#ffff33",
            "#66ff33",
            "#3366ff",
            "#9933ff",
        ]

        const fontSizes = [
            { label: "8px", value: "1" },
            { label: "10px", value: "2" },
            { label: "12px", value: "3" },
            { label: "14px", value: "4" },
            { label: "18px", value: "5" },
            { label: "24px", value: "6" },
            { label: "36px", value: "7" },
        ]

        const fontFamilies = [
            "Arial",
            "Helvetica",
            "Times New Roman",
            "Times",
            "Courier New",
            "Courier",
            "Verdana",
            "Georgia",
            "Palatino",
            "Garamond",
            "Bookman",
            "Comic Sans MS",
            "Trebuchet MS",
            "Arial Black",
            "Impact",
            "Quicksand",
        ]

        return (
            <div className={cn("space-y-2", className)}>
                {/* Load Quicksand font */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />

                {label && (
                    <Label className="text-sm font-medium">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                )}

                <div
                    className={cn(
                        "border rounded-lg overflow-hidden bg-white",
                        error ? "border-red-500" : "border-gray-300",
                        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500",
                    )}
                >
                    {/* Toolbar */}
                    <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
                        {/* Undo/Redo */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => execCommand("undo")}
                            className="h-8 w-8 p-0"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => execCommand("redo")}
                            className="h-8 w-8 p-0"
                            title="Redo (Ctrl+Shift+Z)"
                        >
                            <Redo className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-gray-300 mx-1" />

                        {/* Font Family */}
                        <div className="relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFontFamilyMenu(!showFontFamilyMenu)}
                                className="h-8 px-2 text-xs"
                                title="Font Family"
                            >
                                <Type className="h-4 w-4 mr-1" />
                                Font
                            </Button>
                            {showFontFamilyMenu && (
                                <div className="absolute top-10 left-0 bg-white border rounded-lg shadow-lg p-1 z-10 max-h-48 overflow-y-auto min-w-[140px]">
                                    {fontFamilies.map((font) => (
                                        <button
                                            key={font}
                                            type="button"
                                            className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm whitespace-nowrap transition-colors"
                                            style={{ fontFamily: font }}
                                            onClick={() => {
                                                execCommand("fontName", font)
                                                setShowFontFamilyMenu(false)
                                            }}
                                        >
                                            {font}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Font Size */}
                        <div className="relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
                                className="h-8 px-2 text-xs"
                                title="Font Size"
                            >
                                Size
                            </Button>
                            {showFontSizeMenu && (
                                <div className="absolute top-10 left-0 bg-white border rounded-lg shadow-lg p-1 z-10">
                                    {fontSizes.map((size) => (
                                        <button
                                            key={size.value}
                                            type="button"
                                            className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                                            onClick={() => {
                                                execCommand("fontSize", size.value)
                                                setShowFontSizeMenu(false)
                                            }}
                                        >
                                            {size.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-gray-300 mx-1" />

                        {/* Text Formatting */}
                        <Button
                            type="button"
                            variant={formatState.bold ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("bold")}
                            className="h-8 w-8 p-0"
                            title="Bold (Ctrl+B)"
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={formatState.italic ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("italic")}
                            className="h-8 w-8 p-0"
                            title="Italic (Ctrl+I)"
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={formatState.underline ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("underline")}
                            className="h-8 w-8 p-0"
                            title="Underline (Ctrl+U)"
                        >
                            <Underline className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={formatState.strikethrough ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("strikeThrough")}
                            className="h-8 w-8 p-0"
                            title="Strikethrough"
                        >
                            <Strikethrough className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-gray-300 mx-1" />

                        {/* Color */}
                        <div className="relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="h-8 w-8 p-0"
                                title="Text Color"
                            >
                                <Palette className="h-4 w-4" />
                            </Button>
                            {showColorPicker && (
                                <div className="absolute top-10 left-0 bg-white border rounded-lg shadow-lg p-2 z-10">
                                    <div className="grid grid-cols-6 gap-1">
                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    execCommand("foreColor", color)
                                                    setShowColorPicker(false)
                                                }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-gray-300 mx-1" />

                        {/* Alignment */}
                        <Button
                            type="button"
                            variant={formatState.justifyLeft ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("justifyLeft")}
                            className="h-8 w-8 p-0"
                            title="Align Left"
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={formatState.justifyCenter ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("justifyCenter")}
                            className="h-8 w-8 p-0"
                            title="Align Center"
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={formatState.justifyRight ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("justifyRight")}
                            className="h-8 w-8 p-0"
                            title="Align Right"
                        >
                            <AlignRight className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={formatState.justifyFull ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("justifyFull")}
                            className="h-8 w-8 p-0"
                            title="Justify"
                        >
                            <AlignJustify className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-gray-300 mx-1" />

                        {/* Lists */}
                        <Button
                            type="button"
                            variant={formatState.insertUnorderedList ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("insertUnorderedList")}
                            className="h-8 w-8 p-0"
                            title="Bullet List"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={formatState.insertOrderedList ? "default" : "ghost"}
                            size="sm"
                            onClick={() => execCommand("insertOrderedList")}
                            className="h-8 w-8 p-0"
                            title="Numbered List"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-gray-300 mx-1" />

                        {/* Formatting */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => execCommand("formatBlock", "blockquote")}
                            className="h-8 w-8 p-0"
                            title="Quote"
                        >
                            <Quote className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => execCommand("insertHorizontalRule")}
                            className="h-8 w-8 p-0"
                            title="Horizontal Rule"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-gray-300 mx-1" />

                        {/* Link and Image */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={insertLink}
                            className="h-8 w-8 p-0"
                            title="Insert Link (Ctrl+K)"
                        >
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeLink}
                            className="h-8 w-8 p-0"
                            title="Remove Link"
                        >
                            <Unlink className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={insertImage}
                            className="h-8 w-8 p-0"
                            title="Insert Image"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-6 bg-gray-300 mx-1" />

                        {/* Headings */}
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    execCommand("formatBlock", e.target.value)
                                    e.target.value = ""
                                }
                            }}
                            className="text-sm border rounded px-2 py-1 bg-white h-8"
                            defaultValue=""
                            title="Heading"
                        >
                            <option value="">Heading</option>
                            <option value="h1">Heading 1</option>
                            <option value="h2">Heading 2</option>
                            <option value="h3">Heading 3</option>
                            <option value="h4">Heading 4</option>
                            <option value="h5">Heading 5</option>
                            <option value="h6">Heading 6</option>
                            <option value="p">Paragraph</option>
                        </select>
                    </div>

                    {/* Editor */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleEditorChange}
                        onPaste={handlePaste}
                        onKeyDown={handleKeyDown}
                        onFocus={updateFormatState}
                        onClick={handleEditorClick}
                        className={cn(
                            "min-h-[200px] p-4 outline-none overflow-y-auto prose prose-sm max-w-none",
                            "focus:ring-0 focus:outline-none",
                        )}
                        style={{
                            height: height,
                            fontFamily: "system-ui, -apple-system, sans-serif",
                            fontSize: "14px",
                            lineHeight: "1.6",
                        }}
                        data-placeholder={placeholder}
                    />
                </div>

                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

                {/* Link Dialog */}
                {showLinkDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="link-text" className="text-sm font-medium">
                                        Link Text
                                    </Label>
                                    <Input
                                        id="link-text"
                                        type="text"
                                        value={linkText}
                                        onChange={(e) => setLinkText(e.target.value)}
                                        placeholder="Enter link text"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="link-url" className="text-sm font-medium">
                                        URL
                                    </Label>
                                    <Input
                                        id="link-url"
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="mt-1"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                applyLink()
                                            } else if (e.key === "Escape") {
                                                setShowLinkDialog(false)
                                                setLinkUrl("")
                                                setLinkText("")
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowLinkDialog(false)
                                        setLinkUrl("")
                                        setLinkText("")
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="button" onClick={applyLink}>
                                    Insert Link
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
          
          [contenteditable] h1 {
            font-size: 2em;
            font-weight: bold;
            margin: 0.67em 0;
          }
          
          [contenteditable] h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.75em 0;
          }
          
          [contenteditable] h3 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 0.83em 0;
          }
          
          [contenteditable] h4 {
            font-size: 1em;
            font-weight: bold;
            margin: 1.12em 0;
          }
          
          [contenteditable] h5 {
            font-size: 0.83em;
            font-weight: bold;
            margin: 1.5em 0;
          }
          
          [contenteditable] h6 {
            font-size: 0.75em;
            font-weight: bold;
            margin: 1.67em 0;
          }
          
          [contenteditable] p {
            margin: 1em 0;
          }
          
          [contenteditable] blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 1.5em 0;
            padding: 0.5em 1em;
            background-color: #f9fafb;
            font-style: italic;
          }
          
          [contenteditable] ul, [contenteditable] ol {
            margin: 1em 0;
            padding-left: 2em;
          }
          
          [contenteditable] li {
            margin: 0.5em 0;
          }
          
          [contenteditable] a {
            color: #3b82f6;
            text-decoration: underline;
            cursor: pointer;
            transition: color 0.2s ease;
          }
          
          [contenteditable] a:hover {
            color: #1d4ed8;
            text-decoration: underline;
          }
          
          [contenteditable] img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 0.5em 0;
          }
          
          [contenteditable] hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 2em 0;
          }
          
          [contenteditable] strong, [contenteditable] b {
            font-weight: bold;
          }
          
          [contenteditable] em, [contenteditable] i {
            font-style: italic;
          }
          
          [contenteditable] u {
            text-decoration: underline;
          }
          
          [contenteditable] strike, [contenteditable] s {
            text-decoration: line-through;
          }
        `}</style>
            </div>
        )
    },
)

RichTextEditor.displayName = "RichTextEditor"
