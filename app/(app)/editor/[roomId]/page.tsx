import { checkProjectAccess } from '@/lib/project-access';
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

  return <WorkspacePage projectId={project.id} projectName={project.name} />;
}
