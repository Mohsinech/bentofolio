"use client";

import { useEffect, useState } from "react";
import { EditorProvider, useEditor } from "@/app/lib/editor-context";
import { useProfile, useAuth } from "@/app/lib/hooks";
import { ThemeProvider } from "@/app/lib/theme-context";
import { ThemeEffectsWrapper } from "@/app/components/ThemeEffects";
import { EditorSidebar } from "./EditorSidebar";
import { EditorDndWrapper } from "./EditorDndWrapper";
import { PropertiesPanel } from "./PropertiesPanel";
import { importFromGitHub } from "@/app/lib/github";
import { generateId } from "@/app/lib/utils";
import { BlockLayout, BlockContent, ThemeId, themes } from "@/app/lib/types";
import { Monitor } from "lucide-react";
import styles from "./editor.module.css";

function EditorContent() {
  const { profile, loading, saveProfile, saving, hasProAccess } = useProfile();
  const { githubUsername } = useAuth();
  const { setLayout, setContent, layout, content } = useEditor();
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("dark");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load profile data into editor
  useEffect(() => {
    if (profile) {
      if (profile.layout.length > 0) {
        setLayout(profile.layout);
        setContent(profile.content);
      }
      setCurrentTheme(profile.theme || "dark");
    }
  }, [profile, setLayout, setContent]);

  const handleSave = async () => {
    await saveProfile({ layout, content, theme: currentTheme });
  };

  const handleThemeChange = (theme: ThemeId) => {
    setCurrentTheme(theme);
  };

  const handleCustomDomainChange = async (domain: string) => {
    await saveProfile({ customDomain: domain });
  };

  const handleGitHubImport = async () => {
    if (!githubUsername) return;

    try {
      const data = await importFromGitHub(githubUsername);

      // Create blocks from GitHub data
      const newLayout: BlockLayout[] = [];
      const newContent: Record<string, BlockContent> = {};

      // Identity block
      const identityId = generateId();
      newLayout.push({
        id: identityId,
        type: "identity",
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      });
      newContent[identityId] = { type: "identity", data: data.identityContent };

      // GitHub stats block
      const githubId = generateId();
      newLayout.push({ id: githubId, type: "github", x: 2, y: 0, w: 2, h: 1 });
      newContent[githubId] = { type: "github", data: data.githubContent };

      // Location block (if available)
      if (data.mapContent) {
        const mapId = generateId();
        newLayout.push({ id: mapId, type: "map", x: 0, y: 1, w: 1, h: 1 });
        newContent[mapId] = { type: "map", data: data.mapContent };
      }

      // Tech stack block
      if (data.techStackContent.items.length > 0) {
        const techId = generateId();
        newLayout.push({
          id: techId,
          type: "techstack",
          x: 1,
          y: 1,
          w: 1,
          h: 1,
        });
        newContent[techId] = { type: "techstack", data: data.techStackContent };
      }

      // Social block
      const socialId = generateId();
      newLayout.push({ id: socialId, type: "social", x: 2, y: 1, w: 2, h: 1 });
      newContent[socialId] = { type: "social", data: data.socialContent };

      // Projects block
      if (data.projectsContent.items.length > 0) {
        const projectsId = generateId();
        newLayout.push({
          id: projectsId,
          type: "projects",
          x: 0,
          y: 2,
          w: 2,
          h: 2,
        });
        newContent[projectsId] = {
          type: "projects",
          data: data.projectsContent,
        };
      }

      // Availability block
      const availId = generateId();
      newLayout.push({
        id: availId,
        type: "availability",
        x: 2,
        y: 2,
        w: 2,
        h: 1,
      });
      newContent[availId] = {
        type: "availability",
        data: {
          status: "available",
          message: "Open to new opportunities!",
          forHire: true,
          preferredContact: data.user.html_url,
        },
      };

      setLayout(newLayout);
      setContent(newContent);
    } catch (error) {
      console.error("Failed to import from GitHub:", error);
      alert("Failed to fetch GitHub profile. Please check the username.");
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <div className={styles.container}>
        {/* Fun interactive theme effects */}
        <ThemeEffectsWrapper
          particles={themes[currentTheme]?.particles}
          particleColor={themes[currentTheme]?.particleColor}
          mouseGlow={themes[currentTheme]?.mouseGlow}
          blobs={themes[currentTheme]?.blobs}
          blobColors={themes[currentTheme]?.blobColors}
        />

        {/* Mobile overlay */}
        {isMobile && (
          <div className={styles.mobileOverlay}>
            <div className={styles.mobileMessage}>
              <Monitor size={48} strokeWidth={1.5} />
              <h2>Editor Unavailable on Mobile</h2>
              <p>
                The editor requires a desktop browser for the best experience.
                Please switch to a desktop device to edit your portfolio.
              </p>
            </div>
          </div>
        )}

        {/* Left sidebar - Block palette & actions */}
        <EditorDndWrapper>
          <EditorSidebar
            username={profile?.username}
            onSave={handleSave}
            saving={saving}
            onGitHubImport={handleGitHubImport}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            isPro={hasProAccess}
            customDomain={profile?.customDomain}
            onCustomDomainChange={handleCustomDomainChange}
          />
        </EditorDndWrapper>

        {/* Right sidebar - Properties panel */}
        <PropertiesPanel />
      </div>
    </ThemeProvider>
  );
}

export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  );
}
