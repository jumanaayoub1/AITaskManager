import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Trash2, CheckCircle, Circle, Plus, Sparkles, AlertCircle, Edit2, X, Check } from 'lucide-react';

/**
 * AI-Powered Task Manager (No External API Required)
 * 
 * A modern task management application with intelligent natural language processing
 * built entirely with JavaScript. Demonstrates strong algorithmic thinking and
 * string parsing skills.
 * 
 * Features:
 * - Natural language task input with smart parsing
 * - Intelligent categorization based on keywords
 * - Automatic priority detection from urgency indicators
 * - Date and time extraction from multiple formats
 * - Task filtering and sorting
 * - Recurring task support
 * - Task editing
 * - Local persistence
 * 
 * Technical Skills Demonstrated:
 * - Advanced string manipulation and RegEx
 * - Date/time parsing algorithms
 * - Pattern matching and keyword detection
 * - State management with React hooks
 * - LocalStorage for data persistence
 * - Responsive UI design
 */

const App = () => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskManagerTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
  }, [tasks]);

  /**
   * NATURAL LANGUAGE PARSER - Core Algorithm
   * Parses natural language input to extract task details
   * This replaces the need for an external AI API
   */
  const parseNaturalLanguage = (text) => {
    const lowerText = text.toLowerCase();
    
    // 1. CATEGORY DETECTION
    // Uses keyword matching to intelligently categorize tasks
    const categoryKeywords = {
      Work: ['meeting', 'presentation', 'report', 'project', 'client', 'deadline', 'email', 'call', 'conference'],
      Personal: ['birthday', 'anniversary', 'family', 'friend', 'party', 'dinner', 'lunch', 'movie'],
      Health: ['doctor', 'dentist', 'gym', 'workout', 'exercise', 'medicine', 'appointment', 'health', 'hospital'],
      Finance: ['pay', 'bill', 'rent', 'mortgage', 'tax', 'invoice', 'budget', 'bank', 'payment'],
      Shopping: ['buy', 'purchase', 'shop', 'store', 'grocery', 'groceries', 'mall', 'order', 'get']
    };

    let category = 'Other';
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        category = cat;
        break;
      }
    }

    // 2. PRIORITY DETECTION
    // Identifies urgency keywords to assign priority levels
    const highPriorityKeywords = ['urgent', 'asap', 'important', 'critical', 'immediately', 'priority', 'must'];
    const lowPriorityKeywords = ['maybe', 'someday', 'eventually', 'when possible', 'if time'];
    
    let priority = 'Medium';
    if (highPriorityKeywords.some(keyword => lowerText.includes(keyword))) {
      priority = 'High';
    } else if (lowPriorityKeywords.some(keyword => lowerText.includes(keyword))) {
      priority = 'Low';
    }

    // 3. DATE PARSING
    // Extracts dates from various natural language formats
    let dueDate = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tomorrow
    if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString();
    }
    // Today
    else if (lowerText.includes('today')) {
      dueDate = today.toISOString();
    }
    // Next week
    else if (lowerText.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      dueDate = nextWeek.toISOString();
    }
    // This weekend
    else if (lowerText.includes('weekend') || lowerText.includes('saturday') || lowerText.includes('sunday')) {
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
      const saturday = new Date(today);
      saturday.setDate(saturday.getDate() + daysUntilSaturday);
      dueDate = saturday.toISOString();
    }
    // Days of the week (monday, tuesday, etc.)
    else {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < days.length; i++) {
        if (lowerText.includes(days[i])) {
          const targetDay = i;
          const currentDay = today.getDay();
          let daysToAdd = (targetDay - currentDay + 7) % 7;
          if (daysToAdd === 0) daysToAdd = 7; // Next week if same day
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() + daysToAdd);
          dueDate = targetDate.toISOString();
          break;
        }
      }
    }
    
    // "in X days" pattern
    const inDaysMatch = lowerText.match(/in (\d+) days?/);
    if (inDaysMatch) {
      const days = parseInt(inDaysMatch[1]);
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);
      dueDate = futureDate.toISOString();
    }

    // Specific dates (MM/DD or MM-DD)
    const dateMatch = text.match(/(\d{1,2})[/-](\d{1,2})/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]) - 1;
      const day = parseInt(dateMatch[2]);
      const specificDate = new Date(today.getFullYear(), month, day);
      if (specificDate < today) {
        specificDate.setFullYear(specificDate.getFullYear() + 1);
      }
      dueDate = specificDate.toISOString();
    }
