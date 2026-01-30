import { ComicProjectModel } from './comic-project.model';
import type { ComicProject } from '@dreamweaverstudio/shared-types';

function stripMongoFields(project: ComicProject & { _id?: unknown; __v?: unknown }) {
  const { _id, __v, ...rest } = project;
  return rest as ComicProject;
}

export async function listComicProjects(): Promise<ComicProject[]> {
  const projects = await ComicProjectModel.find().lean<ComicProject[]>();
  return projects.map((project) =>
    stripMongoFields(project as ComicProject & { _id?: unknown; __v?: unknown }),
  );
}

export async function getComicProjectById(
  id: string,
): Promise<ComicProject | null> {
  const project = await ComicProjectModel.findOne({ id }).lean<ComicProject>();
  if (!project) {
    return null;
  }
  return stripMongoFields(project as ComicProject & { _id?: unknown; __v?: unknown });
}

export async function createComicProject(
  input: Omit<ComicProject, 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<ComicProject, 'id'>>,
): Promise<ComicProject> {
  const created = await ComicProjectModel.create(input);
  const project = created.toObject({ versionKey: false });
  return stripMongoFields(project as ComicProject & { _id?: unknown; __v?: unknown });
}
