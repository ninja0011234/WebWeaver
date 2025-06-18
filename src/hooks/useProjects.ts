
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'webWeaverProjects_v1';

export interface Project {
  id: string;
  name: string;
  html: string;
  css: string;
  js: string;
  prompt: string;
}

interface UseProjectsReturn {
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;
  canCreateCheckpoint: boolean;
  lastSuccessfulPrompt: string;
  loadProject: (projectId: string, setCodeStates: (html: string, css: string, js: string, prompt: string) => void) => void;
  saveProject: (
    currentCode: { html: string; css: string; js: string; prompt: string },
    promptForName?: boolean
  ) => void;
  saveCheckpoint: (
    currentCode: { html: string; css: string; js: string },
    currentPromptForCheckpoint: string
  ) => void;
  deleteProject: (projectId: string, onDeletionCallback?: () => void) => void;
  renameProject: (projectId: string) => void;
  setCanCreateCheckpoint: (value: boolean) => void;
  setLastSuccessfulPrompt: (prompt: string) => void;
  clearCurrentProjectSelection: () => void;
  setCurrentProjectId: (id: string | null) => void;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [canCreateCheckpoint, setCanCreateCheckpoint] = useState<boolean>(false);
  const [lastSuccessfulPrompt, setLastSuccessfulPrompt] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error("Error loading projects from localStorage:", error);
      toast({ title: "Error loading projects", description: "Could not load saved projects from your browser.", variant: "destructive" });
    }
  }, [toast]);

  const saveProjectsToLocalStorage = useCallback((updatedProjects: Project[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error("Error saving projects to localStorage:", error);
      toast({ title: "Error Saving Project", description: "Could not save to your browser.", variant: "destructive" });
    }
  }, [toast]);

  const loadProject = useCallback((projectId: string, setCodeStates: (html: string, css: string, js: string, prompt: string) => void) => {
    const projectToLoad = projects.find(p => p.id === projectId);
    if (projectToLoad) {
      setCodeStates(projectToLoad.html, projectToLoad.css, projectToLoad.js, projectToLoad.prompt);
      setCurrentProjectId(projectToLoad.id);
      setCanCreateCheckpoint(false);
      setLastSuccessfulPrompt(projectToLoad.prompt);
      toast({ title: "Project Loaded", description: `"${projectToLoad.name}" has been loaded.` });
    }
  }, [projects, toast]);

  const saveProject = useCallback((
    currentCode: { html: string; css: string; js: string; prompt: string },
    promptForName: boolean = true
  ) => {
    const currentProjectObject = currentProjectId ? projects.find(p => p.id === currentProjectId) : null;
    let projectName = currentProjectObject?.name;

    if (promptForName || !currentProjectObject) {
        const newName = window.prompt("Enter a name for your project:", projectName || "");
        if (newName === null) return; // User cancelled
        if (newName.trim() === "") {
            toast({ title: "Invalid Name", description: "Project name cannot be empty.", variant: "destructive" });
            return;
        }
        projectName = newName.trim();
    }
    
    if (!projectName) { // Should not happen if promptForName is true and user provides a name
      projectName = `Project ${Date.now()}`;
    }

    const newProjectData: Project = {
      id: currentProjectId || Date.now().toString(),
      name: projectName,
      html: currentCode.html,
      css: currentCode.css,
      js: currentCode.js,
      prompt: currentCode.prompt,
    };

    let updatedProjects;
    const existingProjectIndex = projects.findIndex(p => p.id === newProjectData.id);

    if (existingProjectIndex > -1) {
      updatedProjects = projects.map(p => (p.id === newProjectData.id ? newProjectData : p));
    } else {
      updatedProjects = [...projects, newProjectData];
    }

    setProjects(updatedProjects);
    saveProjectsToLocalStorage(updatedProjects);
    setCurrentProjectId(newProjectData.id);
    setCanCreateCheckpoint(false);
    toast({ title: "Project Saved", description: `"${newProjectData.name}" has been saved.` });
  }, [currentProjectId, projects, saveProjectsToLocalStorage, toast]);


  const saveCheckpoint = useCallback((
    currentCode: { html: string; css: string; js: string },
    currentPromptForCheckpoint: string
  ) => {
    const currentProjectNameBase = currentProjectId ? projects.find(p => p.id === currentProjectId)?.name : 'Untitled Project';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const defaultCheckpointName = `${currentProjectNameBase} - Checkpoint ${timestamp}`;
    
    const checkpointName = window.prompt("Enter a name for this checkpoint:", defaultCheckpointName);

    if (checkpointName && checkpointName.trim() !== "") {
      const newCheckpoint: Project = {
        id: Date.now().toString(),
        name: checkpointName.trim(),
        html: currentCode.html,
        css: currentCode.css,
        js: currentCode.js,
        prompt: currentPromptForCheckpoint,
      };

      const updatedProjects = [...projects, newCheckpoint];
      setProjects(updatedProjects);
      saveProjectsToLocalStorage(updatedProjects);
      toast({ title: "Checkpoint Saved", description: `"${newCheckpoint.name}" has been saved.` });
      setCanCreateCheckpoint(false);
    } else if (checkpointName !== null) {
      toast({ title: "Invalid Name", description: "Checkpoint name cannot be empty.", variant: "destructive" });
    }
  }, [currentProjectId, projects, saveProjectsToLocalStorage, toast]);

  const deleteProject = useCallback((projectId: string, onDeletionCallback?: () => void) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${projectToDelete.name}"? This action cannot be undone.`)) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      saveProjectsToLocalStorage(updatedProjects);
      toast({ title: "Item Deleted", description: `"${projectToDelete.name}" has been deleted.` });
      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
        if (onDeletionCallback) onDeletionCallback();
      }
    }
  }, [projects, currentProjectId, saveProjectsToLocalStorage, toast]);

  const renameProject = useCallback((projectId: string) => {
    const projectToRename = projects.find(p => p.id === projectId);
    if (!projectToRename) return;

    const newName = window.prompt("Enter the new name for this item:", projectToRename.name);
    if (newName && newName.trim() !== "") {
      const updatedProjects = projects.map(p =>
        p.id === projectId ? { ...p, name: newName.trim() } : p
      );
      setProjects(updatedProjects);
      saveProjectsToLocalStorage(updatedProjects);
      toast({ title: "Item Renamed", description: `"${projectToRename.name}" renamed to "${newName.trim()}".` });
    } else if (newName !== null) {
      toast({ title: "Invalid Name", description: "Name cannot be empty.", variant: "destructive" });
    }
  }, [projects, saveProjectsToLocalStorage, toast]);
  
  const clearCurrentProjectSelection = useCallback(() => {
    setCurrentProjectId(null);
  }, []);

  const currentProject = projects.find(p => p.id === currentProjectId) || null;

  return {
    projects,
    currentProjectId,
    currentProject,
    canCreateCheckpoint,
    lastSuccessfulPrompt,
    loadProject,
    saveProject,
    saveCheckpoint,
    deleteProject,
    renameProject,
    setCanCreateCheckpoint,
    setLastSuccessfulPrompt,
    clearCurrentProjectSelection,
    setCurrentProjectId,
  };
}
