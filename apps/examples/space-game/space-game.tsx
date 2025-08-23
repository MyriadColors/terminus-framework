/**
 * Space Game ECS Example - Advanced Spaceship System
 *
 * This file demonstrates an Entity-Component-System (ECS) architecture for a space game simulation
 * with comprehensive spaceship functionality. It includes advanced components for spaceships with
 * travel capabilities, cargo management, fuel systems, and FTL travel.
 *
 * Key Features:
 * - Complete spaceship system with AU/day and ly/day travel speeds
 * - Advanced cargo hold management with volume and mass constraints
 * - Fuel consumption mechanics for both regular and FTL travel
 * - Travel planning and route optimization systems
 * - Factory methods for creating different types of spaceships
 * - Point2D integration for position and vector operations
 * - Comprehensive validation and error handling
 * - Configurable systems with factory functions
 * - Detailed logging and debugging capabilities
 *
 * @fileoverview Advanced space game ECS implementation with spaceship systems
 */

/**
 * SPACESHIP SYSTEM OVERVIEW
 *
 * The spaceship system consists of several key components working together:
 *
 * 1. TravelSpeedComponent - Handles regular space travel (AU/day)
 * 2. FTLSpeedComponent - Handles FTL travel (ly/day)
 * 3. CargoHoldComponent - Manages cargo inventory with capacity constraints
 * 4. FuelComponent - Tracks fuel levels and consumption
 * 5. MovementTargetComponent - Stores travel destinations and modes
 *
 * SYSTEMS:
 * - spaceshipMovementSystem: Handles movement with fuel consumption
 * - spaceshipCargoSystem: Manages cargo operations
 * - spaceshipTravelPlanningSystem: Provides travel analysis and optimization
 *
 * FACTORY METHODS:
 * - createSpaceship: Generic spaceship creation
 * - createCargoSpaceship: Specialized cargo ships
 * - createWarship: Military vessels with FTL capability
 * - createColonyShip: Large colony vessels with massive cargo capacity
 *
 * USAGE EXAMPLE:
 * ```typescript
 * // Create a cargo spaceship
 * const cargoShip = EntityFactory.createCargoSpaceship(
 *   world,
 *   "Starlight Freighter",
 *   new Point2D(0, 0),
 *   1000, // cargo volume capacity
 *   5000, // cargo mass capacity
 *   0.3,  // speed in AU/day
 *   2000  // max fuel capacity
 * );
 *
 * // Set a movement target
 * world.addComponent(cargoShip.id, new MovementTargetComponent(
 *   cargoShip.id,
 *   new Point2D(200, 150),
 *   false, // regular travel
 *   new Date(Date.now() + 86400000) // 1 day estimated arrival
 * ));
 *
 * // Add cargo items
 * const cargoHold = world.getComponent(cargoShip.id, CargoHoldComponent);
 * cargoHold.addItem(world, goldOre.id, 100);
 * ```
 */

// Remove unused import that causes compilation issues
// import { Command, CommandResult } from "@/types";
import { Point2D } from "./Point2D";
import {
  BaseComponent,
  Entity,
  EntityId,
  SystemCallback,
  World,
} from "./ecs";

/**
 * Component that stores the name of an entity
 *
 * This component provides a simple way to identify and reference entities
 * in the game world. It's commonly used for display purposes, logging,
 * and entity lookup operations.
 *
 * @example
 * ```typescript
 * const entity = world.createEntity();
 * world.addComponent(entity.id, new NameComponent(entity.id, "Player Ship"));
 * ```
 */
class NameComponent extends BaseComponent {
  /**
   * Creates a new NameComponent
   * @param entityId - The ID of the entity this component belongs to
   * @param name - The name/identifier for this entity
   */
  constructor(entityId: EntityId, public name: string) {
    super(entityId);
  }
}

/**
 * Component that stores the volume of an entity
 *
 * This component represents the physical volume occupied by an entity,
 * commonly used for inventory management, cargo calculations, and
 * spatial reasoning in the game world.
 *
 * @example
 * ```typescript
 * const entity = world.createEntity();
 * world.addComponent(entity.id, new VolumeComponent(entity.id, 10.5));
 * ```
 */
class VolumeComponent extends BaseComponent {
  /**
   * Creates a new VolumeComponent with validation
   * @param entityId - The ID of the entity this component belongs to
   * @param volume - The volume of the entity (must be non-negative)
   * @throws {Error} If volume is negative
   */
  constructor(entityId: EntityId, public volume: number) {
    super(entityId);
    if (volume < 0) {
      throw new Error("Volume cannot be negative");
    }
  }
}

/**
 * Component that stores the mass of an entity
 *
 * This component represents the physical mass of an entity, used for
 * physics calculations, movement dynamics, and trade valuation.
 *
 * @example
 * ```typescript
 * const entity = world.createEntity();
 * world.addComponent(entity.id, new MassComponent(entity.id, 1000));
 * ```
 */
class MassComponent extends BaseComponent {
  /**
   * Creates a new MassComponent with validation
   * @param entityId - The ID of the entity this component belongs to
   * @param mass - The mass of the entity (must be non-negative)
   * @throws {Error} If mass is negative
   */
  constructor(entityId: EntityId, public mass: number) {
    super(entityId);
    if (mass < 0) {
      throw new Error("Mass cannot be negative");
    }
  }
}

/**
 * Component that stores the 2D position of an entity
 *
 * This component represents the spatial coordinates of an entity in
 * a 2D game world. It provides integration with Point2D for advanced
 * mathematical operations and vector calculations.
 *
 * @example
 * ```typescript
 * const entity = world.createEntity();
 * world.addComponent(entity.id, new PositionComponent(entity.id, 100, 200));
 *
 * // Convert to Point2D for calculations
 * const position = world.getComponent(entity.id, PositionComponent);
 * const point = position.toPoint2D();
 * const distance = point.euclideanDistance(Point2D.ZERO);
 * ```
 */
class PositionComponent extends BaseComponent {
  /**
   * Creates a new PositionComponent with validation
   * @param entityId - The ID of the entity this component belongs to
   * @param x - The x-coordinate of the entity
   * @param y - The y-coordinate of the entity
   * @throws {Error} If coordinates are not numbers
   */
  constructor(entityId: EntityId, public x: number, public y: number) {
    super(entityId);
    if (typeof x !== "number" || typeof y !== "number") {
      throw new Error("Position coordinates must be numbers");
    }
  }

  /**
   * Converts this position to a Point2D instance for mathematical operations
   * @returns A new Point2D instance with the same coordinates
   */
  toPoint2D(): Point2D {
    return new Point2D(this.x, this.y);
  }

  /**
   * Updates position from a Point2D instance
   * @param point - The Point2D instance to copy coordinates from
   */
  fromPoint2D(point: Point2D): void {
    this.x = point.x;
    this.y = point.y;
  }
}

/**
 * Component that stores trade-related information for an entity
 *
 * This component marks an entity as a tradable item and provides
 * pricing information with volatility for dynamic market simulation.
 *
 * @example
 * ```typescript
 * const entity = world.createEntity();
 * world.addComponent(entity.id, new TradeItemComponent(
 *   entity.id,
 *   "Gold Ore",
 *   1000,
 *   0.2
 * ));
 * ```
 */
class TradeItemComponent extends BaseComponent {
  /**
   * Creates a new TradeItemComponent with validation
   * @param entityId - The ID of the entity this component belongs to
   * @param itemName - The name of the tradable item
   * @param basePrice - The base price of the item (must be non-negative)
   * @param priceVolatility - The price volatility factor (0-1 range)
   * @throws {Error} If basePrice is negative or volatility is out of range
   */
  constructor(
    entityId: EntityId,
    public itemName: string,
    public basePrice: number,
    public priceVolatility: number
  ) {
    super(entityId);
    if (basePrice < 0) {
      throw new Error("Base price cannot be negative");
    }
    if (priceVolatility < 0 || priceVolatility > 1) {
      throw new Error("Price volatility must be between 0 and 1");
    }
  }
}

/**
 * Component that stores travel speed information for regular space travel
 *
 * This component represents the sub-light travel capabilities of a spaceship,
 * measured in Astronomical Units per day (AU/day). It also includes fuel
 * consumption rates for regular travel and can be used by movement systems
 * to calculate travel times and fuel requirements.
 *
 * @example
 * ```typescript
 * const entity = world.createEntity();
 * world.addComponent(entity.id, new TravelSpeedComponent(entity.id, 0.5, 10));
 * ```
 */
class TravelSpeedComponent extends BaseComponent {
  /**
   * Creates a new TravelSpeedComponent with validation
   * @param entityId - The ID of the entity this component belongs to
   * @param speedAUday - Travel speed in Astronomical Units per day (must be positive)
   * @param fuelConsumptionAU - Fuel consumption per AU traveled (must be non-negative)
   * @throws {Error} If speed is not positive or fuel consumption is negative
   */
  constructor(
    entityId: EntityId,
    public speedAUday: number,
    public fuelConsumptionAU: number
  ) {
    super(entityId);
    if (speedAUday <= 0) {
      throw new Error("Travel speed must be positive");
    }
    if (fuelConsumptionAU < 0) {
      throw new Error("Fuel consumption cannot be negative");
    }
  }

  /**
   * Calculates travel time for a given distance
   * @param distanceAU - Distance in Astronomical Units
   * @returns Travel time in days
   */
  calculateTravelTime(distanceAU: number): number {
    return distanceAU / this.speedAUday;
  }

  /**
   * Calculates fuel required for a given distance
   * @param distanceAU - Distance in Astronomical Units
   * @returns Fuel required
   */
  calculateFuelRequired(distanceAU: number): number {
    return distanceAU * this.fuelConsumptionAU;
  }
}

/**
 * Component that stores FTL (Faster-Than-Light) travel speed information
 *
 * This component represents the FTL capabilities of a spaceship, measured in
 * light years per day (ly/day). It includes fuel consumption rates for FTL
 * travel and a flag indicating whether the ship can perform FTL travel.
 *
 * @example
 * ```typescript
 * const entity = world.createEntity();
 * world.addComponent(entity.id, new FTLSpeedComponent(entity.id, 0.1, 50, true));
 * ```
 */
class FTLSpeedComponent extends BaseComponent {
  /**
   * Creates a new FTLSpeedComponent with validation
   * @param entityId - The ID of the entity this component belongs to
   * @param speedLyday - FTL travel speed in light years per day (must be non-negative)
   * @param fuelConsumptionLy - Fuel consumption per light year traveled (must be non-negative)
   * @param canFTL - Whether this ship can perform FTL travel
   * @throws {Error} If speeds are negative
   */
  constructor(
    entityId: EntityId,
    public speedLyday: number,
    public fuelConsumptionLy: number,
    public canFTL: boolean = false
  ) {
    super(entityId);
    if (speedLyday < 0) {
      throw new Error("FTL speed cannot be negative");
    }
    if (fuelConsumptionLy < 0) {
      throw new Error("FTL fuel consumption cannot be negative");
    }
  }

  /**
   * Calculates FTL travel time for a given distance
   * @param distanceLy - Distance in light years
   * @returns Travel time in days
   */
  calculateTravelTime(distanceLy: number): number {
    if (!this.canFTL || this.speedLyday === 0) {
      return Infinity; // Cannot travel
    }
    return distanceLy / this.speedLyday;
  }

  /**
   * Calculates fuel required for FTL travel
   * @param distanceLy - Distance in light years
   * @returns Fuel required
   */
  calculateFuelRequired(distanceLy: number): number {
    if (!this.canFTL) {
      return Infinity; // Cannot travel
    }
    return distanceLy * this.fuelConsumptionLy;
  }
}

/**
 * Component that represents a cargo item within a cargo hold
 *
 * This component tracks individual items stored in a cargo hold, including
 * the quantity of each item. It's used by the CargoHoldComponent to manage
 * the complex inventory system.
 *
 * @example
 * ```typescript
 * const cargoItem = new CargoItem(entity.id, goldEntity.id, 100);
 * world.addComponent(entity.id, cargoItem);
 * ```
 */
class CargoItem extends BaseComponent {
  /**
   * Creates a new CargoItem
   * @param entityId - The ID of the entity this component belongs to (the cargo hold)
   * @param itemEntityId - The ID of the entity being stored as cargo
   * @param quantity - Quantity of the item (must be positive)
   * @throws {Error} If quantity is not positive
   */
  constructor(
    entityId: EntityId,
    public itemEntityId: EntityId,
    public quantity: number
  ) {
    super(entityId);
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
  }
}

/**
 * Component that manages complex cargo inventory for spaceships
 *
 * This component provides a sophisticated cargo management system that tracks
 * individual items with their volumes and masses. It supports loading, unloading,
 * and inventory management operations with capacity constraints.
 *
 * @example
 * ```typescript
 * const cargoHold = new CargoHoldComponent(entity.id, 1000, 5000);
 * world.addComponent(entity.id, cargoHold);
 * cargoHold.addItem(world, goldEntity.id, 50);
 * ```
 */
class CargoHoldComponent extends BaseComponent {
  /**
   * Creates a new CargoHoldComponent with validation
   * @param entityId - The ID of the entity this component belongs to
   * @param maxVolume - Maximum cargo volume capacity (must be positive)
   * @param maxMass - Maximum cargo mass capacity (must be positive)
   * @throws {Error} If capacities are not positive
   */
  constructor(
    entityId: EntityId,
    public maxVolume: number,
    public maxMass: number
  ) {
    super(entityId);
    if (maxVolume <= 0) {
      throw new Error("Maximum volume must be positive");
    }
    if (maxMass <= 0) {
      throw new Error("Maximum mass must be positive");
    }
  }

  private cargoItems = new Map<EntityId, CargoItem>();

  /**
   * Adds an item to the cargo hold
   * @param world - The world containing the entities
   * @param itemEntityId - ID of the item entity to add
   * @param quantity - Quantity to add (must be positive)
   * @returns True if item was added successfully, false if there's not enough capacity
   */
  addItem(world: World, itemEntityId: EntityId, quantity: number): boolean {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    const volumeComp = world.getComponent(itemEntityId, VolumeComponent);
    const massComp = world.getComponent(itemEntityId, MassComponent);

    if (!volumeComp || !massComp) {
      throw new Error("Item must have volume and mass components");
    }

    // Check if we have enough capacity
    const totalVolumeNeeded = volumeComp.volume * quantity;
    const totalMassNeeded = massComp.mass * quantity;

    if (!this.canAddItem(world, itemEntityId, quantity)) {
      return false;
    }

    // Add or update the cargo item
    const existingItem = this.cargoItems.get(itemEntityId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const cargoItem = new CargoItem(this.entityId, itemEntityId, quantity);
      this.cargoItems.set(itemEntityId, cargoItem);
      world.addComponent(this.entityId, cargoItem);
    }

    return true;
  }

  /**
   * Removes an item from the cargo hold
   * @param itemEntityId - ID of the item entity to remove
   * @param quantity - Quantity to remove (if not specified, removes all)
   * @returns True if item was removed successfully, false if item not found or insufficient quantity
   */
  removeItem(itemEntityId: EntityId, quantity?: number): boolean {
    const cargoItem = this.cargoItems.get(itemEntityId);
    if (!cargoItem) {
      return false;
    }

    if (quantity === undefined || quantity >= cargoItem.quantity) {
      // Remove all or more than available
      this.cargoItems.delete(itemEntityId);
      return true;
    } else if (quantity > 0) {
      // Remove specified quantity
      cargoItem.quantity -= quantity;
      return true;
    }

    return false;
  }

  /**
   * Gets the quantity of a specific item in cargo
   * @param itemEntityId - ID of the item entity
   * @returns Quantity of the item, or 0 if not found
   */
  getItemQuantity(itemEntityId: EntityId): number {
    return this.cargoItems.get(itemEntityId)?.quantity || 0;
  }

  /**
   * Checks if an item can be added to the cargo hold
   * @param world - The world containing the entities
   * @param itemEntityId - ID of the item entity to check
   * @param quantity - Quantity to check
   * @returns True if item can be added, false otherwise
   */
  canAddItem(world: World, itemEntityId: EntityId, quantity: number): boolean {
    const volumeComp = world.getComponent(itemEntityId, VolumeComponent);
    const massComp = world.getComponent(itemEntityId, MassComponent);

    if (!volumeComp || !massComp) {
      return false;
    }

    const totalVolumeNeeded = volumeComp.volume * quantity;
    const totalMassNeeded = massComp.mass * quantity;

    const currentVolume = this.getCurrentVolume(world);
    const currentMass = this.getCurrentMass(world);

    return (
      currentVolume + totalVolumeNeeded <= this.maxVolume &&
      currentMass + totalMassNeeded <= this.maxMass
    );
  }

  /**
   * Gets the current total volume used in the cargo hold
   * @param world - The world containing the entities
   * @returns Current volume usage
   */
  getCurrentVolume(world: World): number {
    let totalVolume = 0;
    for (const cargoItem of this.cargoItems.values()) {
      const volumeComp = world.getComponent(cargoItem.itemEntityId, VolumeComponent);
      if (volumeComp) {
        totalVolume += volumeComp.volume * cargoItem.quantity;
      }
    }
    return totalVolume;
  }

  /**
   * Gets the current total mass used in the cargo hold
   * @param world - The world containing the entities
   * @returns Current mass usage
   */
  getCurrentMass(world: World): number {
    let totalMass = 0;
    for (const cargoItem of this.cargoItems.values()) {
      const massComp = world.getComponent(cargoItem.itemEntityId, MassComponent);
      if (massComp) {
        totalMass += massComp.mass * cargoItem.quantity;
      }
    }
    return totalMass;
  }

  /**
   * Gets the remaining volume capacity
   * @param world - The world containing the entities
   * @returns Remaining volume capacity
   */
  getRemainingVolume(world: World): number {
    return this.maxVolume - this.getCurrentVolume(world);
  }

  /**
   * Gets the remaining mass capacity
   * @param world - The world containing the entities
   * @returns Remaining mass capacity
   */
  getRemainingMass(world: World): number {
    return this.maxMass - this.getCurrentMass(world);
  }

  /**
   * Gets all cargo items in the hold
   * @returns Array of CargoItem components
   */
  getCargoItems(): CargoItem[] {
    return Array.from(this.cargoItems.values());
  }

  /**
   * Clears all cargo from the hold
   */
  clearCargo(): void {
    this.cargoItems.clear();
  }
}

/**
 * Component that manages fuel resources for spaceships
 *
 * This component tracks current fuel levels, maximum capacity, and fuel type.
 * It's used by movement systems to calculate fuel consumption and ensure
 * ships have sufficient fuel for travel.
 *
 * @example
 * ```typescript
 * const fuel = new FuelComponent(entity.id, 1000, 1000, "Antimatter");
 * world.addComponent(entity.id, fuel);
 * ```
 */
class FuelComponent extends BaseComponent {
  /**
   * Creates a new FuelComponent with validation
   * @param entityId - The ID of the entity this component belongs to
   * @param currentFuel - Current fuel amount (must be non-negative)
   * @param maxFuel - Maximum fuel capacity (must be positive)
   * @param fuelType - Type of fuel (e.g., "Antimatter", "Nuclear", "Chemical")
   * @throws {Error} If current fuel is negative or max fuel is not positive
   */
  constructor(
    entityId: EntityId,
    public currentFuel: number,
    public maxFuel: number,
    public fuelType: string
  ) {
    super(entityId);
    if (currentFuel < 0) {
      throw new Error("Current fuel cannot be negative");
    }
    if (maxFuel <= 0) {
      throw new Error("Maximum fuel must be positive");
    }
    if (!fuelType || fuelType.trim() === "") {
      throw new Error("Fuel type cannot be empty");
    }
  }

  /**
   * Adds fuel to the tank
   * @param amount - Amount of fuel to add (must be positive)
   * @returns Actual amount added (may be less than requested if tank would overflow)
   */
  addFuel(amount: number): number {
    if (amount <= 0) {
      return 0;
    }

    const availableSpace = this.maxFuel - this.currentFuel;
    const actualAmount = Math.min(amount, availableSpace);
    this.currentFuel += actualAmount;
    return actualAmount;
  }

  /**
   * Consumes fuel from the tank
   * @param amount - Amount of fuel to consume (must be positive)
   * @returns True if fuel was consumed successfully, false if insufficient fuel
   */
  consumeFuel(amount: number): boolean {
    if (amount <= 0) {
      return true;
    }

    if (this.currentFuel >= amount) {
      this.currentFuel -= amount;
      return true;
    }

    return false;
  }

  /**
   * Gets the fuel level as a percentage of maximum capacity
   * @returns Fuel level percentage (0-100)
   */
  getFuelPercentage(): number {
    return (this.currentFuel / this.maxFuel) * 100;
  }

  /**
   * Checks if there's sufficient fuel for a given amount
   * @param amount - Amount of fuel needed
   * @returns True if sufficient fuel is available
   */
  hasSufficientFuel(amount: number): boolean {
    return this.currentFuel >= amount;
  }

  /**
   * Refuels the tank to maximum capacity
   */
  refuel(): void {
    this.currentFuel = this.maxFuel;
  }
}

/**
 * Component that represents movement targets for spaceships
 *
 * This component stores target positions, travel mode (regular or FTL),
 * and estimated arrival times. It's used by movement systems to
 * manage travel planning and execution.
 *
 * @example
 * ```typescript
 * const target = new MovementTargetComponent(entity.id, new Point2D(100, 200), false, new Date());
 * world.addComponent(entity.id, target);
 * ```
 */
class MovementTargetComponent extends BaseComponent {
  /**
   * Creates a new MovementTargetComponent
   * @param entityId - The ID of the entity this component belongs to
   * @param targetPosition - Target position in 2D space
   * @param isFTL - Whether this is an FTL travel target
   * @param estimatedArrival - Estimated arrival time
   */
  constructor(
    entityId: EntityId,
    public targetPosition: Point2D,
    public isFTL: boolean = false,
    public estimatedArrival: Date = new Date()
  ) {
    super(entityId);
  }

  /**
   * Updates the target position
   * @param newPosition - New target position
   */
  setTargetPosition(newPosition: Point2D): void {
    this.targetPosition = newPosition;
  }

  /**
   * Updates the estimated arrival time
   * @param newArrivalTime - New estimated arrival time
   */
  setEstimatedArrival(newArrivalTime: Date): void {
    this.estimatedArrival = newArrivalTime;
  }

  /**
   * Sets whether this is an FTL travel target
   * @param ftl - True for FTL travel, false for regular travel
   */
  setFTL(ftl: boolean): void {
    this.isFTL = ftl;
  }
}

/**
 * Factory class for creating common entity types with predefined component combinations
 *
 * This class provides static methods to create entities with commonly used
 * component combinations, reducing code duplication and ensuring consistency
 * across the game world. It supports both basic commodities and complex
 * space entities with Point2D integration.
 *
 * @example
 * ```typescript
 * // Create a simple commodity
 * const gold = EntityFactory.createCommodity(world, "Gold", 0.5, 19.3);
 *
 * // Create a tradable item
 * const silver = EntityFactory.createTradeItem(world, "Silver", 0.8, 10.5, 100, 0.3);
 *
 * // Create a positioned entity
 * const position = new Point2D(100, 200);
 * const entity = EntityFactory.createSpaceEntity(world, "Station", position, 10, 1000);
 * ```
 */
class EntityFactory {
  /**
   * Creates a basic commodity entity with name, volume, and mass components
   * @param world - The world to create the entity in
   * @param name - Name of the commodity
   * @param volume - Volume of the commodity
   * @param mass - Mass of the commodity
   * @returns Created entity with basic components
   */
  static createCommodity(
    world: World,
    name: string,
    volume: number,
    mass: number
  ): Entity {
    const entity = world.createEntity();

    world.addComponent(entity.id, new NameComponent(entity.id, name));
    world.addComponent(entity.id, new VolumeComponent(entity.id, volume));
    world.addComponent(entity.id, new MassComponent(entity.id, mass));

    return entity;
  }

  /**
   * Creates a tradable commodity entity with all trade-related components
   * @param world - The world to create the entity in
   * @param name - Name of the tradable item
   * @param volume - Volume of the item
   * @param mass - Mass of the item
   * @param basePrice - Base price for trading
   * @param priceVolatility - Price volatility factor (0-1)
   * @returns Created entity with trade components
   */
  static createTradeItem(
    world: World,
    name: string,
    volume: number,
    mass: number,
    basePrice: number,
    priceVolatility: number
  ): Entity {
    const entity = world.createEntity();

    world.addComponent(entity.id, new NameComponent(entity.id, name));
    world.addComponent(entity.id, new VolumeComponent(entity.id, volume));
    world.addComponent(entity.id, new MassComponent(entity.id, mass));
    world.addComponent(
      entity.id,
      new TradeItemComponent(entity.id, name, basePrice, priceVolatility)
    );

    return entity;
  }

  /**
   * Creates a space entity with position using Point2D coordinates
   * @param world - The world to create the entity in
   * @param name - Name of the entity
   * @param position - Point2D position object
   * @param volume - Volume of the entity
   * @param mass - Mass of the entity
   * @returns Created entity with position component
   */
  static createSpaceEntity(
    world: World,
    name: string,
    position: Point2D,
    volume: number,
    mass: number
  ): Entity {
    const entity = world.createEntity();

    world.addComponent(entity.id, new NameComponent(entity.id, name));
    world.addComponent(
      entity.id,
      new PositionComponent(entity.id, position.x, position.y)
    );
    world.addComponent(entity.id, new VolumeComponent(entity.id, volume));
    world.addComponent(entity.id, new MassComponent(entity.id, mass));

    return entity;
  }

  /**
   * Creates a moving entity with velocity using Point2D vectors
   * @param world - The world to create the entity in
   * @param name - Name of the entity
   * @param position - Point2D initial position
   * @param velocity - Point2D velocity vector
   * @param volume - Volume of the entity
   * @param mass - Mass of the entity
   * @returns Created entity with position and velocity information
   */
  static createMovingEntity(
    world: World,
    name: string,
    position: Point2D,
    velocity: Point2D,
    volume: number,
    mass: number
  ): Entity {
    const entity = world.createEntity();

    world.addComponent(entity.id, new NameComponent(entity.id, name));
    world.addComponent(
      entity.id,
      new PositionComponent(entity.id, position.x, position.y)
    );
    world.addComponent(entity.id, new VolumeComponent(entity.id, volume));
    world.addComponent(entity.id, new MassComponent(entity.id, mass));

    // Note: You would need to create a VelocityComponent class for this to work fully
    // For now, we'll just log the velocity for demonstration
    console.log(
      `Created moving entity ${name} with velocity: ${velocity.toString()}`
    );

    return entity;
  }

  /**
   * Creates a spaceship entity with all spaceship-related components
   * @param world - The world to create the entity in
   * @param name - Name of the spaceship
   * @param position - Point2D initial position
   * @param volume - Volume of the spaceship
   * @param mass - Mass of the spaceship
   * @param speedAUday - Travel speed in AU/day
   * @param fuelConsumptionAU - Fuel consumption per AU
   * @param maxFuel - Maximum fuel capacity
   * @param ftlSpeedLyday - FTL speed in ly/day (optional)
   * @param ftlFuelConsumptionLy - FTL fuel consumption per ly (optional)
   * @param canFTL - Whether the ship can perform FTL travel (default: false)
   * @param cargoVolume - Maximum cargo volume capacity (optional)
   * @param cargoMass - Maximum cargo mass capacity (optional)
   * @returns Created spaceship entity with all components
   */
  static createSpaceship(
    world: World,
    name: string,
    position: Point2D,
    volume: number,
    mass: number,
    speedAUday: number,
    fuelConsumptionAU: number,
    maxFuel: number,
    ftlSpeedLyday?: number,
    ftlFuelConsumptionLy?: number,
    canFTL: boolean = false,
    cargoVolume?: number,
    cargoMass?: number
  ): Entity {
    const entity = world.createEntity();

    world.addComponent(entity.id, new NameComponent(entity.id, name));
    world.addComponent(
      entity.id,
      new PositionComponent(entity.id, position.x, position.y)
    );
    world.addComponent(entity.id, new VolumeComponent(entity.id, volume));
    world.addComponent(entity.id, new MassComponent(entity.id, mass));
    world.addComponent(
      entity.id,
      new TravelSpeedComponent(entity.id, speedAUday, fuelConsumptionAU)
    );
    world.addComponent(entity.id, new FuelComponent(entity.id, maxFuel, maxFuel, "Antimatter"));

    // Add FTL components if specified
    if (ftlSpeedLyday !== undefined && ftlFuelConsumptionLy !== undefined) {
      world.addComponent(
        entity.id,
        new FTLSpeedComponent(entity.id, ftlSpeedLyday, ftlFuelConsumptionLy, canFTL)
      );
    }

    // Add cargo hold components if specified
    if (cargoVolume !== undefined && cargoMass !== undefined) {
      world.addComponent(
        entity.id,
        new CargoHoldComponent(entity.id, cargoVolume, cargoMass)
      );
    }

    return entity;
  }

  /**
   * Creates a simple cargo spaceship with basic capabilities
   * @param world - The world to create the entity in
   * @param name - Name of the cargo ship
   * @param position - Point2D initial position
   * @param cargoVolume - Maximum cargo volume capacity
   * @param cargoMass - Maximum cargo mass capacity
   * @param speedAUday - Travel speed in AU/day
   * @param maxFuel - Maximum fuel capacity
   * @returns Created cargo spaceship entity
   */
  static createCargoSpaceship(
    world: World,
    name: string,
    position: Point2D,
    cargoVolume: number,
    cargoMass: number,
    speedAUday: number,
    maxFuel: number
  ): Entity {
    return EntityFactory.createSpaceship(
      world,
      name,
      position,
      50, // Base spaceship volume
      1000, // Base spaceship mass
      speedAUday,
      5, // Fuel consumption per AU
      maxFuel,
      undefined, // No FTL
      undefined, // No FTL
      false, // No FTL
      cargoVolume,
      cargoMass
    );
  }

  /**
   * Creates a warship with combat capabilities and FTL travel
   * @param world - The world to create the entity in
   * @param name - Name of the warship
   * @param position - Point2D initial position
   * @param speedAUday - Travel speed in AU/day
   * @param ftlSpeedLyday - FTL speed in ly/day
   * @param maxFuel - Maximum fuel capacity
   * @returns Created warship entity
   */
  static createWarship(
    world: World,
    name: string,
    position: Point2D,
    speedAUday: number,
    ftlSpeedLyday: number,
    maxFuel: number
  ): Entity {
    return EntityFactory.createSpaceship(
      world,
      name,
      position,
      30, // Warships are more compact
      800, // Warships are lighter
      speedAUday,
      8, // Higher fuel consumption for combat systems
      maxFuel,
      ftlSpeedLyday,
      ftlSpeedLyday * 50, // FTL fuel consumption
      true, // Can perform FTL
      20, // Limited cargo capacity
      500 // Limited cargo mass
    );
  }

  /**
   * Creates a colony ship with large cargo capacity and slower speed
   * @param world - The world to create the entity in
   * @param name - Name of the colony ship
   * @param position - Point2D initial position
   * @returns Created colony ship entity
   */
  static createColonyShip(
    world: World,
    name: string,
    position: Point2D
  ): Entity {
    return EntityFactory.createSpaceship(
      world,
      name,
      position,
      200, // Very large volume
      5000, // Very heavy
      0.1, // Slow speed
      2, // Efficient fuel consumption
      10000, // Large fuel capacity
      0.05, // Slow FTL speed
      200, // High FTL fuel consumption
      true, // Can perform FTL
      5000, // Massive cargo capacity
      20000 // Massive cargo mass
    );
  }
}

// Example systems
/**
 * Movement system that updates entity positions using Point2D operations
 *
 * This system processes all entities with position components and applies
 * movement logic. It demonstrates Point2D integration for smooth position
 * updates and mathematical operations.
 *
 * @param world - The world containing entities to move
 * @param deltaTime - Time factor for movement calculations (default: 1.0)
 *
 * @example
 * ```typescript
 * world.addSystem((world) => movementSystem(world, 0.016)); // 60 FPS
 * ```
 */
const movementSystem = (world: World, deltaTime: number = 1.0) => {
  const movingEntities = world.getEntitiesWithComponents(PositionComponent);

  for (const entityId of movingEntities) {
    const positionComp = world.getComponent(entityId, PositionComponent);

    if (!positionComp) {
      console.warn(`Entity ${entityId} missing position component`);
      continue;
    }

    // Convert to Point2D for mathematical operations
    const position = positionComp.toPoint2D();

    // Example: Simple circular motion around origin
    const angle = Date.now() * 0.001 * deltaTime;
    const radius = 50;
    const newX = Math.cos(angle) * radius;
    const newY = Math.sin(angle) * radius;

    // Update position using Point2D operations
    const newPosition = new Point2D(newX, newY);
    positionComp.fromPoint2D(newPosition);

    console.log(`Entity ${entityId} moved to: ${newPosition.toString()}`);
  }
};

/**
 * Distance calculation system using Point2D distance methods
 *
 * This system calculates and displays distances between all pairs of
 * positioned entities using different distance metrics (Euclidean,
 * Manhattan, Chebyshev). It showcases the mathematical capabilities
 * of the Point2D class.
 *
 * @param world - The world containing entities to measure distances for
 *
 * @example
 * ```typescript
 * world.addSystem(distanceSystem);
 * ```
 */
const distanceSystem = (world: World) => {
  const entitiesWithPositions = world.getEntitiesWithComponents(
    PositionComponent,
    NameComponent
  );

  if (entitiesWithPositions.length < 2) {
    console.log(
      "Need at least 2 entities with positions to calculate distances"
    );
    return;
  }

  console.log("\n=== Distance Calculations ===");

  // Calculate distances between all pairs of entities
  for (let i = 0; i < entitiesWithPositions.length; i++) {
    for (let j = i + 1; j < entitiesWithPositions.length; j++) {
      const entityId1 = entitiesWithPositions[i];
      const entityId2 = entitiesWithPositions[j];

      const pos1 = world.getComponent(entityId1, PositionComponent);
      const pos2 = world.getComponent(entityId2, PositionComponent);
      const name1 = world.getComponent(entityId1, NameComponent);
      const name2 = world.getComponent(entityId2, NameComponent);

      if (!pos1 || !pos2 || !name1 || !name2) continue;

      const point1 = pos1.toPoint2D();
      const point2 = pos2.toPoint2D();

      // Calculate different distance metrics
      const euclidean = point1.euclideanDistance(point2);
      const manhattan = point1.manhattanDistance(point2);
      const chebyshev = point1.chebyshevDistance(point2);

      console.log(`${name1.name} <-> ${name2.name}:`);
      console.log(`  Euclidean: ${euclidean.toFixed(2)}`);
      console.log(`  Manhattan: ${manhattan.toFixed(2)}`);
      console.log(`  Chebyshev: ${chebyshev.toFixed(2)}`);
    }
  }
};

const tradingSystem = (world: World) => {
  const tradableEntities = world.getEntitiesWithComponents(
    NameComponent,
    TradeItemComponent
  );

  for (const entityId of tradableEntities) {
    const nameComp = world.getComponent(entityId, NameComponent);
    const tradeComp = world.getComponent(entityId, TradeItemComponent);

    if (!nameComp || !tradeComp) {
      console.warn(
        `Entity ${entityId} missing required components for trading`
      );
      continue;
    }

    // Calculate current price based on volatility
    const priceFluctuation = (Math.random() - 0.5) * tradeComp.priceVolatility;
    const currentPrice = tradeComp.basePrice * (1 + priceFluctuation);

    console.log(`${nameComp.name}: ${currentPrice.toFixed(2)}`);
  }
};

const inventorySystem = (world: World) => {
  const items = world.getEntitiesWithComponents(
    NameComponent,
    VolumeComponent,
    MassComponent
  );

  let totalVolume = 0;
  let totalMass = 0;

  for (const entityId of items) {
    const volume = world.getComponent(entityId, VolumeComponent);
    const mass = world.getComponent(entityId, MassComponent);

    if (!volume || !mass) {
      console.warn(
        `Entity ${entityId} missing required components for inventory calculation`
      );
      continue;
    }

    totalVolume += volume.volume;
    totalMass += mass.mass;
  }

  console.log(`Inventory: ${totalVolume} units, ${totalMass} kg`);
};

/**
 * Creates a trading system with configurable parameters
 * @param baseVolatilityFactor - Base factor for price volatility calculations
 * @returns A configured trading system function
 */
const createTradingSystem = (
  baseVolatilityFactor: number = 1.0
): SystemCallback => {
  return (world: World) => {
    const tradableEntities = world.getEntitiesWithComponents(
      NameComponent,
      TradeItemComponent
    );

    for (const entityId of tradableEntities) {
      const nameComp = world.getComponent(entityId, NameComponent);
      const tradeComp = world.getComponent(entityId, TradeItemComponent);

      if (!nameComp || !tradeComp) {
        console.warn(
          `Entity ${entityId} missing required components for trading`
        );
        continue;
      }

      // Calculate current price based on volatility with configurable factor
      const priceFluctuation =
        (Math.random() - 0.5) *
        tradeComp.priceVolatility *
        baseVolatilityFactor;
      const currentPrice = tradeComp.basePrice * (1 + priceFluctuation);

      console.log(`${nameComp.name}: ${currentPrice.toFixed(2)}`);
    }
  };
};

/**
 * Creates an inventory system with configurable logging
 * @param logDetails - Whether to log detailed inventory information
 * @returns A configured inventory system function
 */
const createInventorySystem = (logDetails: boolean = false): SystemCallback => {
  return (world: World) => {
    const items = world.getEntitiesWithComponents(
      NameComponent,
      VolumeComponent,
      MassComponent
    );

    let totalVolume = 0;
    let totalMass = 0;
    let itemCount = 0;

    for (const entityId of items) {
      const volume = world.getComponent(entityId, VolumeComponent);
      const mass = world.getComponent(entityId, MassComponent);

      if (!volume || !mass) {
        console.warn(
          `Entity ${entityId} missing required components for inventory calculation`
        );
        continue;
      }

      totalVolume += volume.volume;
      totalMass += mass.mass;
      itemCount++;

      if (logDetails) {
        console.log(`Item: ${volume.volume} units, ${mass.mass} kg`);
      }
    }

    console.log(
      `Inventory: ${totalVolume} units, ${totalMass} kg (${itemCount} items)`
    );
  };
};

/**
 * Advanced movement system for spaceships with fuel consumption and travel planning
 *
 * This system processes entities with movement capabilities, fuel resources,
 * and target destinations. It handles both regular (AU/day) and FTL (ly/day)
 * travel with proper fuel consumption calculations and position updates.
 *
 * @param world - The world containing entities to move
 * @param deltaTime - Time factor for movement calculations (default: 1.0)
 * @param auToLyConversion - Conversion factor from AU to light years (default: 63241.1)
 *
 * @example
 * ```typescript
 * world.addSystem((world) => spaceshipMovementSystem(world, 0.016)); // 60 FPS
 * ```
 */
const spaceshipMovementSystem = (
  world: World,
  deltaTime: number = 1.0,
  auToLyConversion: number = 63241.1
) => {
  const movingEntities = world.getEntitiesWithComponents(
    PositionComponent,
    MovementTargetComponent,
    FuelComponent
  );

  for (const entityId of movingEntities) {
    const positionComp = world.getComponent(entityId, PositionComponent);
    const targetComp = world.getComponent(entityId, MovementTargetComponent);
    const fuelComp = world.getComponent(entityId, FuelComponent);

    if (!positionComp || !targetComp || !fuelComp) {
      console.warn(`Entity ${entityId} missing required movement components`);
      continue;
    }

    // Check if ship has travel speed capabilities
    const travelSpeedComp = world.getComponent(entityId, TravelSpeedComponent);
    const ftlSpeedComp = world.getComponent(entityId, FTLSpeedComponent);

    if (!travelSpeedComp && !ftlSpeedComp) {
      console.warn(`Entity ${entityId} has no movement capabilities`);
      continue;
    }

    const currentPosition = positionComp.toPoint2D();
    const targetPosition = targetComp.targetPosition;

    // Calculate distance to target
    const distanceAU = currentPosition.euclideanDistance(targetPosition);
    const distanceLy = distanceAU / auToLyConversion;

    // Determine travel mode and calculate movement
    let canTravel = false;
    let fuelRequired = 0;
    let travelTime = 0;

    if (targetComp.isFTL && ftlSpeedComp && ftlSpeedComp.canFTL) {
      // FTL Travel
      fuelRequired = ftlSpeedComp.calculateFuelRequired(distanceLy);
      travelTime = ftlSpeedComp.calculateTravelTime(distanceLy);
      canTravel = fuelComp.hasSufficientFuel(fuelRequired);
    } else if (travelSpeedComp) {
      // Regular Travel
      fuelRequired = travelSpeedComp.calculateFuelRequired(distanceAU);
      travelTime = travelSpeedComp.calculateTravelTime(distanceAU);
      canTravel = fuelComp.hasSufficientFuel(fuelRequired);
    }

    if (!canTravel) {
      console.log(`Entity ${entityId} insufficient fuel for travel (needs: ${fuelRequired.toFixed(2)}, has: ${fuelComp.currentFuel.toFixed(2)})`);
      continue;
    }

    // Calculate movement for this frame
    const movementFactor = deltaTime / travelTime;
    const movementDistance = distanceAU * movementFactor;

    if (movementDistance >= distanceAU) {
      // Arrived at destination
      positionComp.fromPoint2D(targetPosition);
      fuelComp.consumeFuel(fuelRequired);
      
      // Clear target
      targetComp.targetPosition = currentPosition;
      targetComp.estimatedArrival = new Date();
      
      console.log(`Entity ${entityId} arrived at destination`);
    } else {
      // Move towards destination
      const direction = targetPosition.subtract(currentPosition).normalize();
      const newPosition = currentPosition.add(direction.scale(movementDistance));
      positionComp.fromPoint2D(newPosition);

      // Consume fuel proportionally
      const fuelConsumed = fuelRequired * movementFactor;
      fuelComp.consumeFuel(fuelConsumed);

      console.log(`Entity ${entityId} moving to: ${newPosition.toString()}`);
    }
  }
};

/**
 * Cargo management system for spaceships with complex inventory operations
 *
 * This system processes entities with cargo hold components and provides
 * inventory management functionality. It can load, unload, and manage
 * cargo items with proper volume and mass constraints.
 *
 * @param world - The world containing entities with cargo holds
 * @param operation - Operation to perform ('status', 'load', 'unload', 'transfer')
 * @param entityId - Target entity ID for the operation
 * @param itemEntityId - Item entity ID for load/unload operations
 * @param quantity - Quantity for load/unload operations
 *
 * @example
 * ```typescript
 * world.addSystem((world) => spaceshipCargoSystem(world, 'status'));
 * ```
 */
const spaceshipCargoSystem = (
  world: World,
  operation: 'status' | 'load' | 'unload' | 'transfer' = 'status',
  entityId?: EntityId,
  itemEntityId?: EntityId,
  quantity?: number
) => {
  const cargoEntities = world.getEntitiesWithComponents(CargoHoldComponent, NameComponent);

  for (const cargoEntityId of cargoEntities) {
    const cargoHold = world.getComponent(cargoEntityId, CargoHoldComponent);
    const nameComp = world.getComponent(cargoEntityId, NameComponent);

    if (!cargoHold || !nameComp) {
      continue;
    }

    switch (operation) {
      case 'status':
        console.log(`${nameComp.name} Cargo Status:`);
        console.log(`  Volume: ${cargoHold.getCurrentVolume(world).toFixed(2)}/${cargoHold.maxVolume}`);
        console.log(`  Mass: ${cargoHold.getCurrentMass(world).toFixed(2)}/${cargoHold.maxMass}`);
        console.log(`  Items: ${cargoHold.getCargoItems().length}`);
        
        const cargoItems = cargoHold.getCargoItems();
        for (const cargoItem of cargoItems) {
          const itemName = world.getComponent(cargoItem.itemEntityId, NameComponent);
          const volume = world.getComponent(cargoItem.itemEntityId, VolumeComponent);
          const mass = world.getComponent(cargoItem.itemEntityId, MassComponent);
          
          if (itemName && volume && mass) {
            console.log(`    ${itemName.name}: ${cargoItem.quantity} units (${volume.volume * cargoItem.quantity} vol, ${mass.mass * cargoItem.quantity} mass)`);
          }
        }
        break;

      case 'load':
        if (entityId === cargoEntityId && itemEntityId !== undefined && quantity !== undefined) {
          const success = cargoHold.addItem(world, itemEntityId, quantity);
          console.log(`${nameComp.name} ${success ? 'successfully loaded' : 'failed to load'} ${quantity} units of item ${itemEntityId}`);
        }
        break;

      case 'unload':
        if (entityId === cargoEntityId && itemEntityId !== undefined && quantity !== undefined) {
          const success = cargoHold.removeItem(itemEntityId, quantity);
          console.log(`${nameComp.name} ${success ? 'successfully unloaded' : 'failed to unload'} ${quantity} units of item ${itemEntityId}`);
        }
        break;
    }
  }
};

/**
 * Travel planning system for spaceships with route optimization
 *
 * This system helps plan travel routes with fuel efficiency calculations,
 * estimated arrival times, and optimal travel mode selection (regular vs FTL).
 *
 * @param world - The world containing entities to plan travel for
 * @param auToLyConversion - Conversion factor from AU to light years (default: 63241.1)
 *
 * @example
 * ```typescript
 * world.addSystem((world) => spaceshipTravelPlanningSystem(world));
 * ```
 */
const spaceshipTravelPlanningSystem = (
  world: World,
  auToLyConversion: number = 63241.1
) => {
  const entitiesWithPositions = world.getEntitiesWithComponents(
    PositionComponent,
    NameComponent,
    TravelSpeedComponent,
    FuelComponent
  );

  console.log("\n=== Spaceship Travel Planning Analysis ===");

  for (const entityId of entitiesWithPositions) {
    const positionComp = world.getComponent(entityId, PositionComponent);
    const nameComp = world.getComponent(entityId, NameComponent);
    const travelSpeedComp = world.getComponent(entityId, TravelSpeedComponent);
    const fuelComp = world.getComponent(entityId, FuelComponent);

    if (!positionComp || !nameComp || !travelSpeedComp || !fuelComp) {
      continue;
    }

    const currentPosition = positionComp.toPoint2D();
    console.log(`${nameComp.name} at ${currentPosition.toString()}`);
    console.log(`  Fuel: ${fuelComp.currentFuel.toFixed(2)}/${fuelComp.maxFuel} (${fuelComp.getFuelPercentage().toFixed(1)}%)`);
    console.log(`  Travel Speed: ${travelSpeedComp.speedAUday} AU/day`);
    console.log(`  Fuel Efficiency: ${(travelSpeedComp.speedAUday / travelSpeedComp.fuelConsumptionAU).toFixed(2)} AU/fuel`);

    // Check FTL capabilities
    const ftlSpeedComp = world.getComponent(entityId, FTLSpeedComponent);
    if (ftlSpeedComp && ftlSpeedComp.canFTL) {
      console.log(`  FTL Speed: ${ftlSpeedComp.speedLyday} ly/day`);
      console.log(`  FTL Efficiency: ${(ftlSpeedComp.speedLyday / ftlSpeedComp.fuelConsumptionLy).toFixed(2)} ly/fuel`);
    }

    // Calculate maximum range
    const maxRangeAU = fuelComp.currentFuel / travelSpeedComp.fuelConsumptionAU;
    const maxRangeLy = ftlSpeedComp && ftlSpeedComp.canFTL
      ? fuelComp.currentFuel / ftlSpeedComp.fuelConsumptionLy
      : 0;

    console.log(`  Maximum Range: ${maxRangeAU.toFixed(2)} AU (${(maxRangeAU / auToLyConversion).toFixed(4)} ly)`);
    if (maxRangeLy > 0) {
      console.log(`  Maximum FTL Range: ${maxRangeLy.toFixed(4)} ly`);
    }
  }
};

// Usage example:
const world = new World();

// Create a commodity (just add the components you need)
const goldEntity = world.createEntity();
world.addComponent(goldEntity.id, new NameComponent(goldEntity.id, "Gold"));
world.addComponent(goldEntity.id, new VolumeComponent(goldEntity.id, 0.5));
world.addComponent(goldEntity.id, new MassComponent(goldEntity.id, 19.3));

// Create a tradeable commodity (add trade component too)
const silverEntity = world.createEntity();
world.addComponent(
  silverEntity.id,
  new NameComponent(silverEntity.id, "Silver")
);
world.addComponent(silverEntity.id, new VolumeComponent(silverEntity.id, 0.8));
world.addComponent(silverEntity.id, new MassComponent(silverEntity.id, 10.5));
world.addComponent(
  silverEntity.id,
  new TradeItemComponent(silverEntity.id, "Silver", 100, 0.3)
);

// Or use factory functions for convenience
const copperEntity = EntityFactory.createTradeItem(
  world,
  "Copper",
  1.2,
  8.9,
  50,
  0.4
);

// Create various spaceship entities using the factory methods
const cargoShip = EntityFactory.createCargoSpaceship(
  world,
  "Starlight Freighter",
  new Point2D(0, 0),
  1000, // cargo volume capacity
  5000, // cargo mass capacity
  0.3, // speed in AU/day
  2000 // max fuel capacity
);

const warship = EntityFactory.createWarship(
  world,
  "Vanguard Defender",
  new Point2D(100, 100),
  2.0, // speed in AU/day
  0.5, // FTL speed in ly/day
  1500 // max fuel capacity
);

const colonyShip = EntityFactory.createColonyShip(
  world,
  "Genesis Pioneer",
  new Point2D(-50, -50)
);

// Create some cargo items for testing
const goldOre = EntityFactory.createTradeItem(
  world,
  "Gold Ore",
  0.5,
  19.3,
  1000,
  0.2
);

const rareCrystals = EntityFactory.createTradeItem(
  world,
  "Rare Crystals",
  0.2,
  5.0,
  5000,
  0.3
);

const industrialSupplies = EntityFactory.createTradeItem(
  world,
  "Industrial Supplies",
  2.0,
  15.0,
  100,
  0.1
);

// Add cargo to the ships
const cargoHold = world.getComponent(cargoShip.id, CargoHoldComponent);
if (cargoHold) {
  cargoHold.addItem(world, goldOre.id, 100);
  cargoHold.addItem(world, rareCrystals.id, 50);
  cargoHold.addItem(world, industrialSupplies.id, 200);
}

// Set movement targets for the spaceships
world.addComponent(cargoShip.id, new MovementTargetComponent(
  cargoShip.id,
  new Point2D(200, 150),
  false, // regular travel
  new Date(Date.now() + 86400000) // 1 day estimated arrival
));

world.addComponent(warship.id, new MovementTargetComponent(
  warship.id,
  new Point2D(300, 200),
  true, // FTL travel
  new Date(Date.now() + 172800000) // 2 days estimated arrival
));

world.addComponent(colonyShip.id, new MovementTargetComponent(
  colonyShip.id,
  new Point2D(-100, -100),
  false, // regular travel
  new Date(Date.now() + 864000000) // 10 days estimated arrival
));

// Add systems with configuration
world.addSystem(createTradingSystem(1.0)); // Normal volatility
world.addSystem(createInventorySystem(true)); // Detailed logging
world.addSystem((world) => spaceshipTravelPlanningSystem(world)); // Travel planning
world.addSystem((world) => spaceshipCargoSystem(world, 'status')); // Cargo status
world.addSystem((world) => spaceshipMovementSystem(world, 0.1)); // Movement with slower time factor

// Run the world
console.log("=== Starting Space Game Simulation ===");
world.update();
console.log("=== Simulation Complete ===");

// Additional test: Simulate cargo operations
console.log("\n=== Testing Cargo Operations ===");
const cargoHold2 = world.getComponent(cargoShip.id, CargoHoldComponent);
if (cargoHold2) {
  console.log("Attempting to load more cargo...");
  const success = cargoHold2.addItem(world, industrialSupplies.id, 100);
  console.log(`Load result: ${success ? 'Success' : 'Failed (insufficient capacity)'}`);
  
  console.log("Attempting to unload some cargo...");
  cargoHold2.removeItem(goldOre.id, 25);
  console.log("Unloaded 25 units of Gold Ore");
}

// Run another update to see the results
console.log("\n=== Running Second Update ===");
world.update();
console.log("=== Second Update Complete ===");
