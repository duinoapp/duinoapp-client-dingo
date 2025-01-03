
export interface FileItem {
  name: string;
  path: string;
  stat: FileStat;
  icon: string;
  iconColor: string;
  children: FileItem[];
  collapsed: boolean | null;
}
