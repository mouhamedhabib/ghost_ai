import { checkProjectAccess, getCurrentIdentity } from '@/lib/project-access';
import { getProjectsForUser } from '@/lib/projects';
import { WorkspacePage } from '@/components/editor/workspace-page';

type WorkspacePageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function EditorWorkspacePage({
  params,
}: WorkspacePageProps) {
  const { roomId } = await params;
  const project = await checkProjectAccess(roomId);

  if (!project) {
    return null;
  }

  const { owned, shared } = await getProjectsForUser();
  const identity = await getCurrentIdentity();

  return (
    <WorkspacePage
      projectId={project.id}
      projectName={project.name}
      initialProjects={[...owned, ...shared]}
      canManageSharing={project.ownerId === identity?.userId}
    />
  );
}
