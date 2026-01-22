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
