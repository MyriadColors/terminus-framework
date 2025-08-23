type EntityId = number;
type ComponentType<T = any> = new (...args: any[]) => T;
type SystemCallback = (world: World) => void;

interface Component {
  readonly entityId: EntityId;
}

abstract class BaseComponent implements Component {
  constructor(public readonly entityId: EntityId) {}
}

class Entity {
  private static nextId = 1;
  public readonly id: EntityId;

  constructor() {
    this.id = Entity.nextId++;
  }
}

class ComponentStore {
  private components = new Map<ComponentType, Map<EntityId, Component>>();

  add<T extends Component>(entityId: EntityId, component: T): void {
    const componentType = component.constructor as ComponentType<T>;
    
    if (!this.components.has(componentType)) {
      this.components.set(componentType, new Map());
    }
    
    this.components.get(componentType)!.set(entityId, component);
  }

  get<T extends Component>(entityId: EntityId, componentType: ComponentType<T>): T | undefined {
    const componentMap = this.components.get(componentType);
    return componentMap?.get(entityId) as T | undefined;
  }

  has(entityId: EntityId, componentType: ComponentType): boolean {
    const componentMap = this.components.get(componentType);
    return componentMap?.has(entityId) ?? false;
  }

  remove(entityId: EntityId, componentType: ComponentType): boolean {
    const componentMap = this.components.get(componentType);
    return componentMap?.delete(entityId) ?? false;
  }

  removeAllForEntity(entityId: EntityId): void {
    for (const componentMap of this.components.values()) {
      componentMap.delete(entityId);
    }
  }

  getAllOfType<T extends Component>(componentType: ComponentType<T>): T[] {
    const componentMap = this.components.get(componentType);
    return componentMap ? Array.from(componentMap.values()) as T[] : [];
  }

  getEntitiesWithComponent(componentType: ComponentType): EntityId[] {
    const componentMap = this.components.get(componentType);
    return componentMap ? Array.from(componentMap.keys()) : [];
  }

  getEntitiesWithComponents(...componentTypes: ComponentType[]): EntityId[] {
    if (componentTypes.length === 0) return [];
    
    const firstTypeEntities = this.getEntitiesWithComponent(componentTypes[0]);
    
    return firstTypeEntities.filter(entityId => 
      componentTypes.every(type => this.has(entityId, type))
    );
  }
}

class World {
  private entities = new Map<EntityId, Entity>();
  private componentStore = new ComponentStore();
  private systems: SystemCallback[] = [];

  createEntity(): Entity {
    const entity = new Entity();
    this.entities.set(entity.id, entity);
    return entity;
  }

  destroyEntity(entityId: EntityId): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    this.componentStore.removeAllForEntity(entityId);
    return this.entities.delete(entityId);
  }

  addComponent<T extends Component>(entityId: EntityId, component: T): void {
    if (!this.entities.has(entityId)) {
      throw new Error(`Entity ${entityId} does not exist`);
    }
    this.componentStore.add(entityId, component);
  }

  getComponent<T extends Component>(entityId: EntityId, componentType: ComponentType<T>): T | undefined {
    return this.componentStore.get(entityId, componentType);
  }

  hasComponent(entityId: EntityId, componentType: ComponentType): boolean {
    return this.componentStore.has(entityId, componentType);
  }

  removeComponent(entityId: EntityId, componentType: ComponentType): boolean {
    return this.componentStore.remove(entityId, componentType);
  }

  getAllComponents<T extends Component>(componentType: ComponentType<T>): T[] {
    return this.componentStore.getAllOfType(componentType);
  }

  getEntitiesWithComponent(componentType: ComponentType): EntityId[] {
    return this.componentStore.getEntitiesWithComponent(componentType);
  }

  getEntitiesWithComponents(...componentTypes: ComponentType[]): EntityId[] {
    return this.componentStore.getEntitiesWithComponents(...componentTypes);
  }

  addSystem(system: SystemCallback): void {
    this.systems.push(system);
  }

  removeSystem(system: SystemCallback): boolean {
    const index = this.systems.indexOf(system);
    if (index === -1) return false;
    this.systems.splice(index, 1);
    return true;
  }

  update(): void {
    for (const system of this.systems) {
      system(this);
    }
  }

  getEntityCount(): number {
    return this.entities.size;
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  clear(): void {
    this.entities.clear();
    this.componentStore = new ComponentStore();
    this.systems.length = 0;
  }
}

export {
  World,
  Entity,
  BaseComponent,
  type Component,
  type ComponentType,
  type SystemCallback,
  type EntityId
};