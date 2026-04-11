"use client";

import { useSprintTeamsPage } from "../../hooks/use-sprint-teams-page";
import { SprintTeamsHeader } from "./sprint-teams-header";
import { SprintTeamsMemberList } from "./sprint-teams-member-list";
import { SprintTeamsTimeline } from "./sprint-teams-timeline";
import { SprintTeamsSkeleton } from "./sprint-teams-skeleton";
import { TeamDeleteModal } from "@/features/teams/presentation/components/team-delete-modal";

interface SprintTeamsPageProps {
  sprintId: string;
}

export function SprintTeamsPage({ sprintId }: SprintTeamsPageProps) {
  const {
    sprintName,
    projectName,
    isEditMode,
    isMobile,

    sprint,
    sprintDays,
    dayOffDates,
    showWeekends,
    setShowWeekends,

    members,
    filteredMembers,
    memberCount,

    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,

    userSearchQuery,
    setUserSearchQuery,
    availableUsers,
    addMember,

    removeMember,
    updateMemberAllocation,

    hoveredUserId,
    setHoveredUserId,
    setLeave,
    removeLeave,
    getEffectiveLeave,

    handleSave,
    handleCancel,
    handleDelete,
    handleDeleteConfirm,
    closeDeleteModal,
    isDeleteModalOpen,
    isDirty,

    isLoading,
    isSaving,
    isDeleting,
    isUsersLoading,
  } = useSprintTeamsPage({ sprintId });

  if (isLoading) {
    return <SprintTeamsSkeleton />;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <SprintTeamsHeader
        sprintName={sprintName}
        projectName={projectName}
        isEditMode={isEditMode}
        memberCount={memberCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        showWeekends={showWeekends}
        onShowWeekendsChange={setShowWeekends}
        sprintStartDate={sprint?.startDate}
        sprintEndDate={sprint?.endDate}
        onCancel={handleCancel}
        onSave={handleSave}
        onDelete={handleDelete}
        isDirty={isDirty}
        isSaving={isSaving}
        isDeleting={isDeleting}
        isMobile={isMobile}
      />

      {/* Two-panel layout: Left = member list, Right = timeline */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden md:flex-row">
        {/* Left panel: Member list */}
        <div className="flex w-full shrink-0 flex-col md:w-[24rem] lg:w-[28rem]">
          <SprintTeamsMemberList
            members={members}
            filteredMembers={filteredMembers}
            workingHoursDay={sprint?.workingHoursDay ?? 0}
            isMobile={isMobile}
            roleFilter={roleFilter}
            availableUsers={availableUsers}
            userSearchQuery={userSearchQuery}
            onUserSearchChange={setUserSearchQuery}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            onAllocationChange={updateMemberAllocation}
            isUsersLoading={isUsersLoading}
          />
        </div>

        {/* Right panel: Timeline / Gantt */}
        {!isMobile && sprintDays.length > 0 && (
          <SprintTeamsTimeline
            members={filteredMembers}
            days={sprintDays}
            dayOffs={dayOffDates}
            isMobile={isMobile}
            hoveredUserId={hoveredUserId}
            onHover={setHoveredUserId}
            getEffectiveLeave={getEffectiveLeave}
            onSetLeave={setLeave}
            onRemoveLeave={removeLeave}
          />
        )}
      </div>

      <TeamDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        teamName={`${sprintName}${projectName ? ` (${projectName})` : ""}`}
        isLoading={isDeleting}
      />
    </div>
  );
}
