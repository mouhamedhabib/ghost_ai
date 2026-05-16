import { getProjectsForUser } from "@/lib/projects"
import { EditorHomeClient } from "@/components/editor/editor-home-client"

export async function EditorHome() {
  // Let errors propagate to error boundary - don't catch them here
  const { owned, shared } = await getProjectsForUser()

  return <EditorHomeClient owned={owned} shared={shared} />
}
