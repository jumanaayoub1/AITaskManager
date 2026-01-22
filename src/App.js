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

    
    // 4. TIME PARSING
    // Extracts time from multiple formats
    let dueTime = null;
    
    // 12-hour format with am/pm (e.g., "3pm", "3:30pm", "3 pm")
    const time12Match = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (time12Match) {
      let hours = parseInt(time12Match[1]);
      const minutes = time12Match[2] ? parseInt(time12Match[2]) : 0;
      const meridiem = time12Match[3].toLowerCase();
      
      if (meridiem === 'pm' && hours !== 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      
      dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // 24-hour format (e.g., "15:00", "15:30")
    const time24Match = text.match(/(\d{1,2}):(\d{2})/);
    if (time24Match && !time12Match) {
      const hours = parseInt(time24Match[1]);
      const minutes = parseInt(time24Match[2]);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    // Word-based times (e.g., "noon", "midnight", "morning", "evening")
    if (lowerText.includes('noon')) dueTime = '12:00';
    else if (lowerText.includes('midnight')) dueTime = '00:00';
    else if (lowerText.includes('morning')) dueTime = '09:00';
    else if (lowerText.includes('afternoon')) dueTime = '14:00';
    else if (lowerText.includes('evening')) dueTime = '18:00';
    else if (lowerText.includes('night')) dueTime = '20:00';

    // 5. RECURRING PATTERN DETECTION
    let recurring = 'none';
    if (lowerText.includes('every day') || lowerText.includes('daily')) {
      recurring = 'daily';
    } else if (lowerText.includes('every week') || lowerText.includes('weekly')) {
      recurring = 'weekly';
    } else if (lowerText.includes('every month') || lowerText.includes('monthly')) {
      recurring = 'monthly';
    }

    // 6. CLEAN TITLE
    // Remove date/time/priority keywords from the title for a clean display
    let title = text
      .replace(/\b(urgent|asap|important|critical|immediately|priority)\b/gi, '')
      .replace(/\b(tomorrow|today|next week|this weekend|in \d+ days?)\b/gi, '')
      .replace(/\d{1,2}:\d{2}\s*(am|pm)?/gi, '')
      .replace(/\d{1,2}\s*(am|pm)/gi, '')
      .replace(/\bat\s+/gi, '')
      .replace(/\bon\s+/gi, '')
      .replace(/\b(every day|daily|every week|weekly|every month|monthly)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return {
      title,
      category,
      priority,
      dueDate,
      dueTime,
      recurring
    };
  };

  /**
   * Add a new task from natural language input
   */
  const handleAddTask = () => {
    if (!inputText.trim()) return;

    const parsedData = parseNaturalLanguage(inputText);
    
    const newTask = {
      id: Date.now(),
      ...parsedData,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setInputText('');
  };

  /**
   * Handle Enter key in input field
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputText.trim()) {
      handleAddTask();
    }
  };

  /**
   * Start editing a task
   */
  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditText(task.title);
  };

  /**
   * Save edited task
   */
  const saveEdit = () => {
    if (!editText.trim()) return;
    
    setTasks(tasks.map(task =>
      task.id === editingTask
        ? { ...task, title: editText.trim() }
        : task
    ));
    setEditingTask(null);
    setEditText('');
  };

  /**
   * Cancel editing
   */
  const cancelEdit = () => {
    setEditingTask(null);
    setEditText('');
  };

  /**
   * Toggle task completion
   */
  const toggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  /**
   * Delete a task
   */
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  /**
   * Filter tasks by completion status
   */
  const getFilteredTasks = () => {
    if (filter === 'active') return tasks.filter(t => !t.completed);
    if (filter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
  };

  /**
   * Sort tasks by selected criteria
   */
  const getSortedTasks = () => {
    const filtered = getFilteredTasks();

    return [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'priority') {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.priority] - order[b.priority];
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });
  };

  /**
   * Format date for human-readable display
   */
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /**
   * Get Tailwind color classes for categories
   */
  const getCategoryColor = (category) => {
    const colors = {
      Work: 'bg-blue-100 text-blue-700 border-blue-300',
      Personal: 'bg-purple-100 text-purple-700 border-purple-300',
      Health: 'bg-green-100 text-green-700 border-green-300',
      Finance: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Shopping: 'bg-pink-100 text-pink-700 border-pink-300',
      Other: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[category] || colors.Other;
  };

  /**
   * Get Tailwind color classes for priorities
   */
  const getPriorityColor = (priority) => {
    const colors = {
      High: 'text-red-600',
      Medium: 'text-orange-600',
      Low: 'text-green-600'
    };
    return colors[priority];
  };

  // Computed values
  const sortedTasks = getSortedTasks();
  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Smart Task Manager</h1>
          </div>
          <p className="text-gray-600">Natural language task parsing with zero external APIs</p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="text-2xl font-bold text-indigo-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Task Input */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 'Buy groceries tomorrow at 3pm' or 'Important: Team meeting Monday morning'"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddTask}
                disabled={!inputText.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'active'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-gray-400 mb-2">
                <CheckCircle className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-gray-600 text-lg">
                {filter === 'completed' ? 'No completed tasks yet' :
                 filter === 'active' ? 'No active tasks' :
                 'No tasks yet'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Add your first task using natural language above
              </p>
            </div>
          ) : (
            sortedTasks.map(task => (
              <div
                key={task.id}
                className={`bg-white rounded-lg shadow-sm p-4 border-l-4 transition-all hover:shadow-md ${
                  task.completed ? 'opacity-60' : ''
                } ${getPriorityColor(task.priority).replace('text-', 'border-')}`}
              >
                <div className="flex items-start gap-3">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1">
                    {editingTask === task.id ? (
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="p-1 text-green-600 hover:text-green-700">
                          <Check className="w-5 h-5" />
                        </button>
                        <button onClick={cancelEdit} className="p-1 text-gray-600 hover:text-gray-700">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>
                    )}
                    
                    {/* Task Metadata Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}>
                        <Tag className="w-3 h-3" />
                        {task.category}
                      </span>

                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} bg-gray-50 border border-gray-200`}>
                        {task.priority} Priority
                      </span>

                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}

                      {task.dueTime && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                          <Clock className="w-3 h-3" />
                          {task.dueTime}
                        </span>
                      )}

                      {task.recurring !== 'none' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Repeats {task.recurring}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    {editingTask !== task.id && (
                      <button
                        onClick={() => startEdit(task)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Example Prompts */}
        <div className="mt-8 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">💡 Try these examples:</h3>
          <div className="text-sm text-indigo-700 space-y-1">
            <p>• "Buy milk tomorrow at 3pm"</p>
            <p>• "Urgent: Submit report by Friday"</p>
            <p>• "Doctor appointment next Monday morning"</p>
            <p>• "Gym workout every day"</p>
            <p>• "Pay rent on 1/1"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
