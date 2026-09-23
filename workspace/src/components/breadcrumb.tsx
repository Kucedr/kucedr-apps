import * as React from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import type { WorkspaceTreeEntry } from '@kucedr/sdk';

import { Button } from '@/components/ui/button';
import {
	TreeExpander,
	TreeIcon,
	TreeLabel,
	TreeNode,
	TreeNodeContent,
	TreeNodeTrigger,
	TreeProvider,
	TreeView,
} from '@/components/kibo-ui/tree';
import { WorkspaceBreadcrumbItem } from '@/components/breadcrumb-item';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { findWorkspaceEntry } from '@/lib/find';

interface WorkspaceBreadcrumbProps {
	entries: WorkspaceTreeEntry[];
	onFileSelect: (entry: WorkspaceTreeEntry) => void;
	path: string;
}

function WorkspaceBreadcrumbTree({
	entries,
	onFileSelect,
}: Pick<WorkspaceBreadcrumbProps, 'entries' | 'onFileSelect'>) {
	const renderEntry = (entry: WorkspaceTreeEntry, depth: number, isLast: boolean): React.ReactNode => {
		const children = entry.children ?? [];
		const isDirectory = entry.type === 'directory';
		const hasChildren = children.length > 0;
		return (
			<TreeNode key={entry.path} isLast={isLast} level={depth} nodeId={entry.path}>
				<TreeNodeTrigger
					expandOnClick={hasChildren}
					className="mx-0 h-7 gap-1.5 rounded-sm px-1.5 py-0 text-xs"
					onClick={() => {
						if (!isDirectory) onFileSelect(entry);
					}}
				>
					<TreeExpander hasChildren={hasChildren} />
					<TreeIcon hasChildren={isDirectory} className="mr-1.5" />
					<TreeLabel className="text-xs">{entry.name}</TreeLabel>
				</TreeNodeTrigger>
				<TreeNodeContent hasChildren={hasChildren}>
					{children.map((child, index) => renderEntry(child, depth + 1, index === children.length - 1))}
				</TreeNodeContent>
			</TreeNode>
		);
	};

	return (
		<TreeProvider animateExpand={false} selectable={false} showLines={false}>
			<TreeView className="p-1" role="tree">
				{entries.map((entry, index) => renderEntry(entry, 0, index === entries.length - 1))}
			</TreeView>
		</TreeProvider>
	);
}

export function WorkspaceBreadcrumb({
	entries,
	onFileSelect,
	path,
}: WorkspaceBreadcrumbProps) {
	const segments = path.split(/[\\/]/).filter(Boolean);
	const separator = path.includes('\\') ? '\\' : '/';
	const [treeOpen, setTreeOpen] = React.useState(false);
	return (
		<nav aria-label="File path" className="flex min-w-0 flex-1 items-center overflow-hidden text-xs">
			<DropdownMenu open={treeOpen} onOpenChange={setTreeOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="mr-1 size-7 shrink-0"
						aria-label="Browse workspace root"
					>
						<Folder />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="max-h-80 min-w-64 overflow-y-auto p-0">
					<WorkspaceBreadcrumbTree
						entries={entries}
						onFileSelect={(entry) => {
							setTreeOpen(false);
							onFileSelect(entry);
						}}
					/>
				</DropdownMenuContent>
			</DropdownMenu>
			{segments.map((segment, index) => {
				const segmentPath = segments.slice(0, index + 1).join(separator);
				const isFile = index === segments.length - 1;
				const items = findWorkspaceEntry(entries, segmentPath)?.children ?? [];
				return (
					<React.Fragment key={segmentPath}>
						{index > 0 ? <ChevronRight className="mx-0.5 size-3 shrink-0 text-muted-foreground" /> : null}
						{isFile ? (
							<span className="min-w-0 truncate font-medium" title={path}>
								{segment}
							</span>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-6 max-w-32 shrink truncate px-1.5 text-xs font-medium"
										aria-label={`Browse ${segment}`}
									>
										{segment}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="max-h-80 min-w-56 overflow-y-auto">
									{items.map((item) => (
										<WorkspaceBreadcrumbItem
											key={item.path}
											entry={item}
											onFileSelect={onFileSelect}
										/>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</React.Fragment>
				);
			})}
		</nav>
	);
}
