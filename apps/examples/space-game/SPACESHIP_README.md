# Spaceship System Documentation

This document provides comprehensive documentation for the advanced spaceship system implemented in the space-game example.

## Overview

The spaceship system is a complete implementation of space vessel mechanics using Entity-Component-System (ECS) architecture. It supports both regular space travel and Faster-Than-Light (FTL) movement, with sophisticated cargo management and fuel consumption mechanics.

## Core Components

### 1. TravelSpeedComponent

Handles regular space travel measured in Astronomical Units per day (AU/day).

**Properties:**

- `speedAUday`: Travel speed in AU/day (must be positive)
- `fuelConsumptionAU`: Fuel consumption per AU traveled (must be non-negative)

**Methods:**

- `calculateTravelTime(distanceAU: number)`: Returns travel time in days
- `calculateFuelRequired(distanceAU: number)`: Returns fuel required for the journey

### 2. FTLSpeedComponent

Handles FTL travel measured in light years per day (ly/day).

**Properties:**

- `speedLyday`: FTL travel speed in ly/day (must be non-negative)
- `fuelConsumptionLy`: Fuel consumption per light year traveled (must be non-negative)
- `canFTL`: Whether this ship can perform FTL travel (default: false)

**Methods:**

- `calculateTravelTime(distanceLy: number)`: Returns FTL travel time in days
- `calculateFuelRequired(distanceLy: number)`: Returns FTL fuel required

### 3. CargoHoldComponent

Manages complex cargo inventory with volume and mass constraints.

**Properties:**

- `maxVolume`: Maximum cargo volume capacity (must be positive)
- `maxMass`: Maximum cargo mass capacity (must be positive)

**Methods:**

- `addItem(world, itemEntityId, quantity)`: Adds cargo to the hold
- `removeItem(itemEntityId, quantity?)`: Removes cargo from the hold
- `canAddItem(world, itemEntityId, quantity)`: Checks if item can be added
- `getCurrentVolume(world)`: Returns current volume usage
- `getCurrentMass(world)`: Returns current mass usage
- `getRemainingVolume(world)`: Returns remaining volume capacity
- `getRemainingMass(world)`: Returns remaining mass capacity

### 4. FuelComponent

Tracks fuel levels and consumption for both regular and FTL travel.

**Properties:**

- `currentFuel`: Current fuel amount (must be non-negative)
- `maxFuel`: Maximum fuel capacity (must be positive)
- `fuelType`: Type of fuel (e.g., "Antimatter", "Nuclear", "Chemical")

**Methods:**

- `addFuel(amount)`: Adds fuel to the tank
- `consumeFuel(amount)`: Consumes fuel from the tank
- `getFuelPercentage()`: Returns fuel level as percentage
- `hasSufficientFuel(amount)`: Checks if sufficient fuel is available
- `refuel()`: Refuels the tank to maximum capacity

### 5. MovementTargetComponent

Stores travel destinations and modes.

**Properties:**

- `targetPosition`: Target position in 2D space
- `isFTL`: Whether this is an FTL travel target (default: false)
- `estimatedArrival`: Estimated arrival time (default: current time)

**Methods:**

- `setTargetPosition(newPosition)`: Updates the target position
- `setEstimatedArrival(newArrivalTime)`: Updates estimated arrival time
- `setFTL(ftl)`: Sets travel mode (FTL vs regular)

## Systems

### 1. spaceshipMovementSystem

Handles movement with fuel consumption and position updates.

**Features:**

- Supports both regular and FTL travel
- Calculates fuel consumption based on distance and speed
- Updates positions smoothly over time
- Handles arrival detection and target clearing

### 2. spaceshipCargoSystem

Manages cargo operations including loading, unloading, and status reporting.

**Operations:**

- `status`: Display cargo hold status
- `load`: Load items into cargo hold
- `unload`: Remove items from cargo hold
- `transfer`: Transfer items between cargo holds (future enhancement)

### 3. spaceshipTravelPlanningSystem

Provides travel analysis and optimization capabilities.

**Features:**

- Calculates fuel efficiency ratios
- Determines maximum travel ranges
- Shows estimated arrival times
- Compares regular vs FTL travel options

## Factory Methods

### 1. createSpaceship

Generic spaceship creation with all components.

**Parameters:**

- `world`: The world to create the entity in
- `name`: Name of the spaceship
- `position`: Initial position (Point2D)
- `volume`: Volume of the spaceship
- `mass`: Mass of the spaceship
- `speedAUday`: Travel speed in AU/day
- `fuelConsumptionAU`: Fuel consumption per AU
- `maxFuel`: Maximum fuel capacity
- `ftlSpeedLyday`: Optional FTL speed in ly/day
- `ftlFuelConsumptionLy`: Optional FTL fuel consumption per ly
- `canFTL`: Whether the ship can perform FTL travel (default: false)
- `cargoVolume`: Optional maximum cargo volume capacity
- `cargoMass`: Optional maximum cargo mass capacity

### 2. createCargoSpaceship

Specialized cargo ships with large cargo capacity.

**Characteristics:**

- Moderate speed (0.3 AU/day)
- Large cargo hold capacity
- No FTL capability
- Efficient fuel consumption

### 3. createWarship

Military vessels with combat capabilities and FTL travel.

**Characteristics:**

- High speed (2.0 AU/day)
- FTL capability (0.5 ly/day)
- Limited cargo capacity
- Higher fuel consumption

### 4. createColonyShip

Large colony vessels with massive cargo capacity.

**Characteristics:**

- Slow speed (0.1 AU/day)
- Large cargo capacity
- FTL capability (0.05 ly/day)
- Massive fuel capacity

## Usage Examples

### Basic Spaceship Creation

```typescript
const cargoShip = EntityFactory.createCargoSpaceship(
  world,
  "Starlight Freighter",
  new Point2D(0, 0),
  1000, // cargo volume capacity
  5000, // cargo mass capacity
  0.3, // speed in AU/day
  2000 // max fuel capacity
);
```

### Setting Movement Targets

```typescript
world.addComponent(
  cargoShip.id,
  new MovementTargetComponent(
    cargoShip.id,
    new Point2D(200, 150),
    false, // regular travel
    new Date(Date.now() + 86400000) // 1 day estimated arrival
  )
);
```

### Cargo Management

```typescript
const cargoHold = world.getComponent(cargoShip.id, CargoHoldComponent);
if (cargoHold) {
  // Add cargo
  cargoHold.addItem(world, goldOre.id, 100);

  // Check capacity
  if (cargoHold.canAddItem(world, rareCrystals.id, 50)) {
    cargoHold.addItem(world, rareCrystals.id, 50);
  }

  // Remove cargo
  cargoHold.removeItem(goldOre.id, 25);
}
```

### Travel Planning

```typescript
// Add travel planning system
world.addSystem((world) => spaceshipTravelPlanningSystem(world));

// This will output detailed analysis including:
// - Current fuel levels and percentages
// - Travel speeds and efficiency ratios
// - Maximum ranges for both regular and FTL travel
// - Distance calculations in both AU and light years
```

## Physics and Units

### Distance Units

- **AU (Astronomical Unit)**: Average distance from Earth to Sun (~149.6 million km)
- **Light Year**: Distance light travels in one year (~9.46 trillion km)
- **Conversion**: 1 AU ≈ 63241.1 light years

### Speed Units

- **AU/day**: Astronomical Units per day for regular space travel
- **ly/day**: Light years per day for FTL travel

### Fuel Consumption

- Regular travel: Fuel units per AU traveled
- FTL travel: Fuel units per light year traveled

## Performance Considerations

1. **Entity Management**: The ECS architecture efficiently handles large numbers of entities
2. **Component Access**: Components are stored in optimized maps for fast lookup
3. **Batch Operations**: Systems process multiple entities in single passes
4. **Memory Efficiency**: Components use minimal memory with proper typing

## Future Enhancements

1. **Combat System**: Add weapons, shields, and combat mechanics
2. **Economic System**: Implement trading, markets, and resource management
3. **Multiplayer Support**: Add networking for multiplayer space simulation
4. **Visual Rendering**: Integrate with graphics engines for visual representation
5. **AI Navigation**: Implement autonomous navigation and pathfinding
6. **Dynamic Events**: Add random events like solar flares, pirate attacks, etc.

## Testing

The system includes comprehensive testing with:

- Multiple spaceship types (cargo, warship, colony ship)
- Cargo loading and unloading operations
- Movement with fuel consumption
- Travel planning and analysis
- Error handling and validation

Run the test with:

```bash
cd apps/examples/space-game
npx tsx space-game.tsx
```

This will demonstrate all features of the spaceship system with detailed output showing movement, cargo operations, and travel planning.
