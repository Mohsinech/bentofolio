"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BlockLayout, BlockContent } from "./types";
import { demoLayout, demoContent } from "./demo-data";
import { DEFAULT_MEMOJI_AVATAR } from "./memoji";
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
          return { w: 4, h: 1 };
        case "saas":
        case "github":
        case "availability":
        case "link":
        case "resume":
        case "map":
          return { w: 2, h: 1 };
        case "experience":
        case "education":
        case "projects":
        case "techstack":
        case "work":
        case "spotify":
        case "instagram":
        case "gallery":
        case "youtube":
          return { w: 2, h: 2 };
        case "services":
        case "tools":
        case "stats":
          return { w: 2, h: 1 };
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
          title: "Product Designer @ YourStudio",
          avatar: DEFAULT_MEMOJI_AVATAR,
          bio: "Designing calm products, useful systems, and tiny details people remember.",
          location: "Remote",
          email: "hello@example.com",
          website: "example.com",
          availability: "Available for work",
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
      education: {
        type: "education",
        data: {
          title: "Education",
          items: [
            {
              school: "Design School",
              degree: "Product Design",
              period: "2021 - 2024",
              description: "Design systems, interaction, and visual craft.",
            },
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
      link: {
        type: "link",
        data: {
          url: "",
          title: "Let's collaborate",
          eyebrow: "Start here",
          actionType: "email",
          variant: "surface",
        },
      },
      work: {
        type: "work",
        data: {
          title: "Recent work",
          subtitle: "Selected projects",
          email: "hello@icloud.com",
          items: [
            {
              title: "Mobile portfolio system",
              client: "Northstar Studio",
              category: "Product design",
              year: "2026",
              image: "",
              url: "https://example.com",
            },
            {
              title: "Creative dashboard",
              client: "Bento Labs",
              category: "Web app",
              year: "2025",
              image: "",
              url: "",
            },
          ],
        },
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
          username: "",
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
          eyebrow: "Connect",
          heading: "Social Links",
          variant: "icons",
          items: [],
        },
      },
      availability: {
        type: "availability",
        data: {
          status: "available",
          message: "Open to new opportunities!",
          forHire: true,
          preferredContact: "hello@example.com",
          responseTime: "Replies within 24h",
          timezone: "GMT+1",
          nextOpening: "2 spots this month",
          rate: "Projects from $2k",
          ctaLabel: "Start a project",
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
      gallery: {
        type: "gallery",
        data: { title: "Gallery", images: [] },
      },
      instagram: {
        type: "instagram",
        data: {
          handle: "@yourhandle",
          profileUrl: "https://instagram.com/yourhandle",
          image: "",
          followers: "12.4k",
          posts: "186",
          engagement: "8.7%",
          featuredPostUrl: "",
        },
      },
      youtube: {
        type: "youtube",
        data: { title: "Featured video", url: "" },
      },
      services: {
        type: "services",
        data: {
          title: "What I can help with",
          items: ["Product design", "Framer", "Web apps", "Brand systems"],
        },
      },
      tools: {
        type: "tools",
        data: {
          title: "Tools I use",
          items: [
            { name: "Figma", icon: "F" },
            { name: "Framer", icon: "Fr" },
            { name: "Notion", icon: "N" },
          ],
        },
      },
      stats: {
        type: "stats",
        data: {
          items: [
            { value: "6+", label: "Years" },
            { value: "42", label: "Projects" },
            { value: "12k", label: "Users reached" },
            { value: "98%", label: "Happy clients" },
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
