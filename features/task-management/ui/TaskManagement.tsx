'use client';

import { useTaskManagement } from '../model/useTaskManagement';
import { TaskManagementHeader } from './TaskManagementHeader';
import { TaskManagementContent } from './TaskManagementContent';
import { TaskForm } from './TaskForm';
import { CategoryManagement } from './CategoryManagement';
import { LoadingSpinner } from '@/shared/ui';

export function TaskManagement() {
  const {
    filters,
    taskFormOpen,
    categoryFormOpen,
    editingTask,
    isListPanelOpen,
    selectedAssignees,
    allAssignees,
    filteredTasks,
    dateRange,
    categories,
    isLoading,
    showInProgressOnly,
    dateRangeMode,
    setIsListPanelOpen,
    setTaskFormOpen,
    setCategoryFormOpen,
    setShowInProgressOnly,
    setDateRangeMode,
    handleAssigneeToggle,
    handleCreateTask,
    handleEditTask,
    handleTaskSubmit,
    handleDeleteTask,
    handleFilterChange,
    handleCategoryCreate,
    handleCategoryUpdate,
    handleCategoryDelete,
    createTaskMutation,
    updateTaskMutation,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  } = useTaskManagement();

  if (isLoading) {
    return <LoadingSpinner text='데이터를 불러오는 중...' />;
  }

  return (
    <div className='flex h-screen flex-col'>
      <TaskManagementHeader
        isListPanelOpen={isListPanelOpen}
        onToggleListPanel={() => setIsListPanelOpen(!isListPanelOpen)}
        allAssignees={allAssignees}
        selectedAssignees={selectedAssignees}
        onAssigneeToggle={handleAssigneeToggle}
        showInProgressOnly={showInProgressOnly}
        onShowInProgressOnlyChange={setShowInProgressOnly}
        dateRangeMode={dateRangeMode}
        onDateRangeModeChange={setDateRangeMode}
        onOpenCategoryManagement={() => setCategoryFormOpen(true)}
        onCreateTask={handleCreateTask}
      />

      <TaskManagementContent
        isListPanelOpen={isListPanelOpen}
        filters={filters}
        categories={categories}
        tasks={filteredTasks}
        dateRange={dateRange}
        onFilterChange={handleFilterChange}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={editingTask}
        categories={categories}
        onSubmit={handleTaskSubmit}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <CategoryManagement
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        categories={categories}
        onCreate={handleCategoryCreate}
        onUpdate={handleCategoryUpdate}
        onDelete={handleCategoryDelete}
        isLoading={
          createCategoryMutation.isPending ||
          updateCategoryMutation.isPending ||
          deleteCategoryMutation.isPending
        }
      />
    </div>
  );
}
