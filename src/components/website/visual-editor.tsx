"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  Settings,
  Save,
  Eye,
  Undo,
  Redo,
  Plus,
  Trash2,
  Move,
  Copy,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Link,
  Video,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Users,
  GripVertical,
  Edit3,
} from "lucide-react";

interface ContentBlock {
  id: string;
  type:
    | "text"
    | "image"
    | "video"
    | "button"
    | "gallery"
    | "contact"
    | "events"
    | "staff"
    | "testimonials"
    | "spacer";
  content: any;
  style: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    textAlign?: "left" | "center" | "right";
    fontSize?: string;
    fontWeight?: string;
  };
}

interface WebsiteSection {
  id: string;
  name: string;
  blocks: ContentBlock[];
  containerStyle: {
    backgroundColor: string;
    paddingTop: string;
    paddingBottom: string;
  };
}

const initialSections: WebsiteSection[] = [
  {
    id: "1",
    name: "Hero Section",
    containerStyle: {
      backgroundColor: "#FE7743",
      paddingTop: "80px",
      paddingBottom: "80px",
    },
    blocks: [
      {
        id: "hero-title",
        type: "text",
        content: {
          text: "Welcome to Grace Community Church",
          tag: "h1",
        },
        style: {
          textColor: "#FFFFFF",
          textAlign: "center",
          fontSize: "48px",
          fontWeight: "bold",
          margin: "0 0 20px 0",
        },
      },
      {
        id: "hero-subtitle",
        type: "text",
        content: {
          text: "A place where faith, hope, and love come together in community.",
          tag: "p",
        },
        style: {
          textColor: "#FFFFFF",
          textAlign: "center",
          fontSize: "20px",
          margin: "0 0 30px 0",
        },
      },
      {
        id: "hero-button",
        type: "button",
        content: {
          text: "Visit Us This Sunday",
          link: "#services",
        },
        style: {
          textAlign: "center",
        },
      },
    ],
  },
  {
    id: "2",
    name: "About Section",
    containerStyle: {
      backgroundColor: "#FFFFFF",
      paddingTop: "60px",
      paddingBottom: "60px",
    },
    blocks: [
      {
        id: "about-title",
        type: "text",
        content: {
          text: "About Our Church",
          tag: "h2",
        },
        style: {
          textColor: "#273F4F",
          textAlign: "center",
          fontSize: "36px",
          fontWeight: "bold",
          margin: "0 0 30px 0",
        },
      },
      {
        id: "about-image",
        type: "image",
        content: {
          src: "/api/placeholder/600/400",
          alt: "Church building exterior",
          caption: "Our beautiful sanctuary welcomes all",
        },
        style: {
          textAlign: "center",
          margin: "0 0 30px 0",
        },
      },
      {
        id: "about-text",
        type: "text",
        content: {
          text: "For over 50 years, Grace Community Church has been a beacon of hope in our community. We believe in the power of faith to transform lives and bring people together in meaningful relationships.",
          tag: "p",
        },
        style: {
          textColor: "#273F4F",
          textAlign: "center",
          fontSize: "18px",
          margin: "0 auto",
          padding: "0 20px",
        },
      },
    ],
  },
];

const blockTemplates = [
  { type: "text", label: "Text Block", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "video", label: "Video", icon: Video },
  { type: "button", label: "Button", icon: Layout },
  { type: "gallery", label: "Image Gallery", icon: ImageIcon },
  { type: "contact", label: "Contact Info", icon: Phone },
  { type: "events", label: "Events List", icon: Calendar },
  { type: "staff", label: "Staff Grid", icon: Users },
  { type: "testimonials", label: "Testimonials", icon: Type },
  { type: "spacer", label: "Spacer", icon: Move },
];

export function VisualWebsiteEditor() {
  const [sections, setSections] = useState<WebsiteSection[]>(initialSections);
  const [selectedSection, setSelectedSection] = useState<string>("1");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSection = sections.find((s) => s.id === selectedSection);
  const currentBlock = currentSection?.blocks.find(
    (b) => b.id === selectedBlock
  );

  const addSection = () => {
    const newSection: WebsiteSection = {
      id: Date.now().toString(),
      name: "New Section",
      containerStyle: {
        backgroundColor: "#FFFFFF",
        paddingTop: "60px",
        paddingBottom: "60px",
      },
      blocks: [],
    };
    setSections((prev) => [...prev, newSection]);
  };

  const addBlock = (sectionId: string, blockType: string) => {
    const newBlock: ContentBlock = {
      id: `${blockType}-${Date.now()}`,
      type: blockType as any,
      content: getDefaultContent(blockType),
      style: getDefaultStyle(blockType),
    };

    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, blocks: [...section.blocks, newBlock] }
          : section
      )
    );
  };

  const updateBlock = (
    sectionId: string,
    blockId: string,
    updates: Partial<ContentBlock>
  ) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              blocks: section.blocks.map((block) =>
                block.id === blockId ? { ...block, ...updates } : block
              ),
            }
          : section
      )
    );
  };

  const deleteBlock = (sectionId: string, blockId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              blocks: section.blocks.filter((block) => block.id !== blockId),
            }
          : section
      )
    );
    setSelectedBlock("");
  };

  const updateSectionStyle = (
    sectionId: string,
    updates: Partial<WebsiteSection["containerStyle"]>
  ) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              containerStyle: { ...section.containerStyle, ...updates },
            }
          : section
      )
    );
  };

  const getDefaultContent = (blockType: string) => {
    switch (blockType) {
      case "text":
        return { text: "Enter your text here...", tag: "p" };
      case "image":
        return { src: "/api/placeholder/400/300", alt: "Image description" };
      case "video":
        return { src: "", embedCode: "" };
      case "button":
        return { text: "Click here", link: "#" };
      case "contact":
        return {
          phone: "(555) 123-4567",
          email: "info@church.org",
          address: "123 Church St, City, State 12345",
        };
      case "events":
        return {
          events: [
            { title: "Sunday Service", date: "Every Sunday", time: "10:00 AM" },
            { title: "Bible Study", date: "Wednesdays", time: "7:00 PM" },
          ],
        };
      default:
        return {};
    }
  };

  const getDefaultStyle = (blockType: string) => {
    switch (blockType) {
      case "text":
        return {
          textColor: "#273F4F",
          textAlign: "left" as const,
          fontSize: "16px",
          margin: "0 0 20px 0",
        };
      case "button":
        return {
          textAlign: "center" as const,
          margin: "20px 0",
        };
      default:
        return {
          margin: "20px 0",
        };
    }
  };

  const handleImageUpload = (blockId: string) => {
    fileInputRef.current?.click();
  };

  const renderBlock = (
    block: ContentBlock,
    sectionId: string,
    isSelected: boolean
  ) => {
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedBlock(block.id);
      setSelectedSection(sectionId);
    };

    const blockStyle = {
      ...block.style,
      position: "relative" as const,
      cursor: previewMode ? "default" : "pointer",
      outline: isSelected && !previewMode ? "2px solid #FE7743" : "none",
      outlineOffset: "4px",
    };

    const commonProps = {
      style: blockStyle,
      onClick: handleClick,
      className: `block-content ${
        isSelected && !previewMode ? "selected" : ""
      }`,
    };

    switch (block.type) {
      case "text":
        const Tag = block.content.tag || "p";
        return (
          <Tag key={block.id} {...commonProps}>
            {block.content.text}
            {isSelected && !previewMode && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-8 right-0 bg-white border"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditMode(true);
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </Tag>
        );

      case "image":
        return (
          <div key={block.id} {...commonProps}>
            <img
              src={block.content.src}
              alt={block.content.alt}
              className="max-w-full h-auto mx-auto rounded-lg shadow-md"
              style={{ maxWidth: "600px" }}
            />
            {block.content.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">
                {block.content.caption}
              </p>
            )}
            {isSelected && !previewMode && (
              <div className="absolute -top-8 right-0 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white border"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageUpload(block.id);
                  }}
                >
                  <Upload className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white border"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode(true);
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        );

      case "button":
        return (
          <div key={block.id} {...commonProps}>
            <Button
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
              style={{
                backgroundColor: "#FE7743",
                margin:
                  block.style.textAlign === "center" ? "0 auto" : undefined,
                display:
                  block.style.textAlign === "center" ? "block" : "inline-block",
              }}
            >
              {block.content.text}
            </Button>
            {isSelected && !previewMode && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-8 right-0 bg-white border"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditMode(true);
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "contact":
        return (
          <div
            key={block.id}
            {...commonProps}
            className="bg-gray-50 p-6 rounded-lg"
          >
            <h3 className="font-bold text-xl mb-4 text-center">Contact Us</h3>
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{block.content.phone}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{block.content.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{block.content.address}</span>
              </div>
            </div>
            {isSelected && !previewMode && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-8 right-0 bg-white border"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditMode(true);
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "events":
        return (
          <div
            key={block.id}
            {...commonProps}
            className="bg-gray-50 p-6 rounded-lg"
          >
            <h3 className="font-bold text-xl mb-4 text-center">
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {block.content.events?.map((event: any, index: number) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {event.date} at {event.time}
                  </p>
                </div>
              ))}
            </div>
            {isSelected && !previewMode && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-8 right-0 bg-white border"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditMode(true);
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "spacer":
        return (
          <div
            key={block.id}
            {...commonProps}
            className={`${
              isSelected && !previewMode
                ? "bg-gray-100 border-2 border-dashed border-gray-300"
                : ""
            }`}
            style={{
              ...blockStyle,
              height: "40px",
              minHeight: "40px",
            }}
          >
            {isSelected && !previewMode && (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Spacer Block
              </div>
            )}
          </div>
        );

      default:
        return (
          <div
            key={block.id}
            {...commonProps}
            className="p-4 bg-gray-100 rounded"
          >
            <p>Unknown block type: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-auto">
      {/* Left Sidebar - Block Library */}
      {!previewMode && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Add Blocks</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid gap-2">
              {blockTemplates.map((template) => (
                <Button
                  key={template.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                  onClick={() =>
                    currentSection && addBlock(currentSection.id, template.type)
                  }
                >
                  <template.icon className="h-3 w-3" />
                  {template.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Editor Area */}
      <Card className={`${previewMode ? "lg:col-span-12" : "lg:col-span-7"}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Website Editor</CardTitle>
              <CardDescription>
                Click to select and edit content blocks
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {previewMode ? "Exit Preview" : "Preview"}
              </Button>
              <Button size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[600px] max-h-[800px] overflow-auto bg-white">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`min-h-20 ${
                  !previewMode && selectedSection === section.id
                    ? "ring-2 ring-blue-400"
                    : ""
                }`}
                style={{
                  backgroundColor: section.containerStyle.backgroundColor,
                  paddingTop: section.containerStyle.paddingTop,
                  paddingBottom: section.containerStyle.paddingBottom,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                }}
                onClick={() => !previewMode && setSelectedSection(section.id)}
              >
                <div className="max-w-4xl mx-auto relative">
                  {!previewMode && selectedSection === section.id && (
                    <div className="absolute -top-6 left-0 flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        {section.name}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open section settings
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {section.blocks.length === 0 && !previewMode ? (
                    <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-4">
                        This section is empty
                      </p>
                      <p className="text-sm text-gray-400">
                        Add blocks from the sidebar to get started
                      </p>
                    </div>
                  ) : (
                    section.blocks.map((block) =>
                      renderBlock(
                        block,
                        section.id,
                        selectedBlock === block.id &&
                          selectedSection === section.id
                      )
                    )
                  )}
                </div>
              </div>
            ))}

            {/* Add Section Button */}
            {!previewMode && (
              <div className="p-8 text-center border-t">
                <Button
                  onClick={addSection}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Sidebar - Properties Panel */}
      {!previewMode && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentBlock ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium">Block Type</Label>
                  <Badge variant="outline" className="ml-2">
                    {currentBlock.type}
                  </Badge>
                </div>

                {currentBlock.type === "text" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Text Content</Label>
                      <Textarea
                        value={currentBlock.content.text}
                        onChange={(e) =>
                          updateBlock(selectedSection, currentBlock.id, {
                            content: {
                              ...currentBlock.content,
                              text: e.target.value,
                            },
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Text Tag</Label>
                      <Select
                        value={currentBlock.content.tag}
                        onValueChange={(value) =>
                          updateBlock(selectedSection, currentBlock.id, {
                            content: { ...currentBlock.content, tag: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h1">Heading 1</SelectItem>
                          <SelectItem value="h2">Heading 2</SelectItem>
                          <SelectItem value="h3">Heading 3</SelectItem>
                          <SelectItem value="p">Paragraph</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {currentBlock.type === "button" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Button Text</Label>
                      <Input
                        value={currentBlock.content.text}
                        onChange={(e) =>
                          updateBlock(selectedSection, currentBlock.id, {
                            content: {
                              ...currentBlock.content,
                              text: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Link URL</Label>
                      <Input
                        value={currentBlock.content.link}
                        onChange={(e) =>
                          updateBlock(selectedSection, currentBlock.id, {
                            content: {
                              ...currentBlock.content,
                              link: e.target.value,
                            },
                          })
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label className="text-xs">Text Alignment</Label>
                  <div className="flex gap-1">
                    {["left", "center", "right"].map((align) => (
                      <Button
                        key={align}
                        variant={
                          currentBlock.style.textAlign === align
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateBlock(selectedSection, currentBlock.id, {
                            style: {
                              ...currentBlock.style,
                              textAlign: align as any,
                            },
                          })
                        }
                      >
                        {align === "left" && <AlignLeft className="h-3 w-3" />}
                        {align === "center" && (
                          <AlignCenter className="h-3 w-3" />
                        )}
                        {align === "right" && (
                          <AlignRight className="h-3 w-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentBlock.style.textColor || "#000000"}
                      onChange={(e) =>
                        updateBlock(selectedSection, currentBlock.id, {
                          style: {
                            ...currentBlock.style,
                            textColor: e.target.value,
                          },
                        })
                      }
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={currentBlock.style.textColor || "#000000"}
                      onChange={(e) =>
                        updateBlock(selectedSection, currentBlock.id, {
                          style: {
                            ...currentBlock.style,
                            textColor: e.target.value,
                          },
                        })
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      deleteBlock(selectedSection, currentBlock.id)
                    }
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete Block
                  </Button>
                </div>
              </div>
            ) : currentSection ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium">
                    Section Settings
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Section Name</Label>
                  <Input
                    value={currentSection.name}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((section) =>
                          section.id === selectedSection
                            ? { ...section, name: e.target.value }
                            : section
                        )
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentSection.containerStyle.backgroundColor}
                      onChange={(e) =>
                        updateSectionStyle(selectedSection, {
                          backgroundColor: e.target.value,
                        })
                      }
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={currentSection.containerStyle.backgroundColor}
                      onChange={(e) =>
                        updateSectionStyle(selectedSection, {
                          backgroundColor: e.target.value,
                        })
                      }
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Top Padding</Label>
                    <Input
                      value={currentSection.containerStyle.paddingTop}
                      onChange={(e) =>
                        updateSectionStyle(selectedSection, {
                          paddingTop: e.target.value,
                        })
                      }
                      placeholder="60px"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Bottom Padding</Label>
                    <Input
                      value={currentSection.containerStyle.paddingBottom}
                      onChange={(e) =>
                        updateSectionStyle(selectedSection, {
                          paddingBottom: e.target.value,
                        })
                      }
                      placeholder="60px"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm">
                <p>Select a section or block to edit its properties</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedBlock) {
            // In a real app, you would upload the file and get a URL
            const mockUrl = URL.createObjectURL(file);
            updateBlock(selectedSection, selectedBlock, {
              content: { ...currentBlock?.content, src: mockUrl },
            });
          }
        }}
      />
    </div>
  );
}
