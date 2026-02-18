"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BlockLayout, BlockContent } from "./types";
import { demoLayout, demoContent } from "./demo-data";
import { generateId } from "./utils";

interface EditorState {
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  selectedBlockId: string | null;
  isEditMode: boolean;
}

interface EditorContextType extends EditorState {
  setLayout: (layout: BlockLayout[]) => void;
  setContent: (content: Record<string, BlockContent>) => void;
  selectBlock: (id: string | null) => void;
  toggleEditMode: () => void;
  addBlock: (type: BlockLayout["type"]) => void;
  removeBlock: (id: string) => void;
  updateBlockContent: (id: string, content: BlockContent) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<BlockLayout[]>(demoLayout);
  const [content, setContent] =
    useState<Record<string, BlockContent>>(demoContent);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);

  const selectBlock = (id: string | null) => {
    setSelectedBlockId(id);
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
    setSelectedBlockId(null);
  };

  const addBlock = (type: BlockLayout["type"]) => {
    const id = generateId();

    // Determine block size based on type
    const getBlockSize = (t: BlockLayout["type"]) => {
      switch (t) {
        case "identity":
        case "saas":
        case "github":
        case "youtube":
          return { w: 2, h: 1 };
        case "experience":
        case "projects":
        case "career":
        case "techstack":
          return { w: 2, h: 2 };
        case "social":
        case "network":
          return { w: 2, h: 1 };
        case "spotify":
          return { w: 1, h: 2 };
        default:
          return { w: 1, h: 1 };
      }
    };

    const size = getBlockSize(type);
    const newBlock: BlockLayout = {
      id,
      type,
      x: 0,
      y: layout.length,
      w: size.w,
      h: size.h,
    };

    // Default content for each block type
    const defaultContent: Record<string, BlockContent> = {
      identity: {
        type: "identity",
        data: {
          name: "Your Name",
          title: "Your Title",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + id,
        },
      },
      map: {
        type: "map",
        data: { location: "Your City", lat: 0, lng: 0 },
      },
      techstack: {
        type: "techstack",
        data: { items: [{ name: "Add Tech", icon: "🔧" }] },
      },
      experience: {
        type: "experience",
        data: {
          items: [
            { company: "Company", role: "Role", period: "2024 - Present" },
          ],
        },
      },
      spotify: {
        type: "spotify",
        data: {
          type: "embed",
          spotifyUrl: "", // User will paste their Spotify URL
        },
      },
      metrics: {
        type: "metrics",
        data: { items: [{ value: "0", label: "Metric" }] },
      },
      link: {
        type: "link",
        data: { url: "https://example.com", title: "Link" },
      },
      text: {
        type: "text",
        data: { text: "Your text here..." },
      },
      saas: {
        type: "saas",
        data: {
          name: "My SaaS",
          tagline: "Ship fast, grow faster",
          url: "https://example.com",
          mrr: 1000,
          revenue: [
            200, 400, 600, 800, 1000, 1200, 1500, 2000, 2500, 3000, 3500, 4000,
          ],
        },
      },
      github: {
        type: "github",
        data: {
          username: "github",
          followers: 0,
          following: 0,
          publicRepos: 0,
          totalStars: 0,
        },
      },
      projects: {
        type: "projects",
        data: {
          items: [
            {
              name: "project-name",
              description: "A cool project",
              url: "https://github.com",
              stars: 0,
              forks: 0,
              language: "TypeScript",
              languageColor: "#3178c6",
            },
          ],
        },
      },
      social: {
        type: "social",
        data: {
          items: [
            { platform: "github", url: "https://github.com/yourusername" },
            { platform: "twitter", url: "https://twitter.com/yourusername" },
            {
              platform: "linkedin",
              url: "https://linkedin.com/in/yourusername",
            },
            { platform: "dribbble", url: "https://dribbble.com/yourusername" },
            { platform: "website", url: "https://yourwebsite.com" },
          ],
        },
      },
      availability: {
        type: "availability",
        data: {
          status: "available",
          message: "Open to new opportunities!",
          forHire: true,
        },
      },
      quote: {
        type: "quote",
        data: {
          quote: "This person is amazing to work with!",
          author: "Someone Great",
          role: "CEO",
          company: "Amazing Co",
        },
      },
      resume: {
        type: "resume",
        data: {
          title: "My Resume",
          fileUrl: "",
          lastUpdated: new Date().toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        },
      },
      youtube: {
        type: "youtube",
        data: {
          channelName: "My Channel",
          subscribers: "0",
          videoUrl: "",
        },
      },
      instagram: {
        type: "instagram",
        data: {
          profileUrl: "", // User will paste Instagram profile URL
          username: "",
        },
      },
      network: {
        type: "network",
        data: {
          title: "My Network",
          connections: [
            {
              name: "Friend 1",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
            },
            {
              name: "Friend 2",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
            },
            {
              name: "Friend 3",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
            },
          ],
        },
      },
      career: {
        type: "career",
        data: {
          title: "Career Journey",
          positions: [
            {
              company: "Tech Startup",
              role: "Frontend Developer",
              dateRange: "2020 - 2022",
              description: "Built responsive web applications",
            },
            {
              company: "Big Tech Co",
              role: "Senior Developer",
              dateRange: "2022 - 2024",
              description: "Led frontend architecture",
            },
            {
              company: "Innovation Labs",
              role: "Tech Lead",
              dateRange: "2024 - Present",
              description: "Managing engineering team",
              current: true,
            },
          ],
        },
      },
    };

    setLayout((prev) => [...prev, newBlock]);
    setContent((prev) => ({
      ...prev,
      [id]: defaultContent[type],
    }));
    setSelectedBlockId(id);
  };

  const removeBlock = (id: string) => {
    setLayout((prev) => prev.filter((block) => block.id !== id));
    setContent((prev) => {
      const newContent = { ...prev };
      delete newContent[id];
      return newContent;
    });
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  const updateBlockContent = (id: string, newContent: BlockContent) => {
    setContent((prev) => ({
      ...prev,
      [id]: newContent,
    }));
  };

  const reorderBlocks = (activeId: string, overId: string) => {
    setLayout((prev) => {
      const oldIndex = prev.findIndex((block) => block.id === activeId);
      const newIndex = prev.findIndex((block) => block.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const newLayout = [...prev];
      const [movedBlock] = newLayout.splice(oldIndex, 1);
      newLayout.splice(newIndex, 0, movedBlock);

      return newLayout;
    });
  };

  return (
    <EditorContext.Provider
      value={{
        layout,
        content,
        selectedBlockId,
        isEditMode,
        setLayout,
        setContent,
        selectBlock,
        toggleEditMode,
        addBlock,
        removeBlock,
        updateBlockContent,
        reorderBlocks,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
