import { getProjectsForUser } from "@/lib/projects"
import { EditorHomeClient } from "@/components/editor/editor-home-client"

export async function EditorHome() {
  const { owned, shared } = await getProjectsForUser()

  return <EditorHomeClient owned={owned} shared={shared} />
}
