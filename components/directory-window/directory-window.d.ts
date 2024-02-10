
export interface FileItem {
  name: string
  path: string
  stat: FileStat
  children: FileItem[]
}