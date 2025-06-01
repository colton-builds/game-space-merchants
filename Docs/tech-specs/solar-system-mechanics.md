# Solar System and Gravitational Mechanics

## Overview
This document outlines the technical specifications for implementing the solar system's gravitational mechanics and orbital dynamics. The system must provide realistic gravitational interactions while maintaining playability and allowing for user configuration.

## 1. Gravitational Force Calculation

### 1.1 Base Formula
```typescript
// Gravitational force between two bodies
F = G * (m1 * m2) / r²

Where:
- F = Force vector
- G = Gravitational constant (configurable)
- m1, m2 = Masses of the two bodies
- r = Distance between bodies
```

### 1.2 Implementation Details
- Force is calculated as a vector pointing from the ship to the celestial body
- Force magnitude is capped to prevent overwhelming effects
- Minimum distance threshold to prevent division by zero
- Force is scaled by a configurable factor for gameplay balance

## 2. Celestial Body Properties

### 2.1 Star
```typescript
interface Star {
    position: Vector2D;
    mass: number;        // Base: 1000000
    radius: number;      // Base: 100
    gravitationalRange: number;  // Maximum distance for significant effect
}
```

### 2.2 Planets
```typescript
interface Planet {
    name: string;
    position: Vector2D;
    mass: number;        // Range: 1000-10000
    radius: number;      // Range: 20-50
    orbitRadius: number; // Distance from star
    orbitSpeed: number;  // Angular velocity
    gravitationalRange: number;  // Maximum distance for significant effect
}
```

## 3. Gravitational Settings

### 3.1 Configurable Parameters
```typescript
interface GravitationalSettings {
    baseGravity: number;     // Base gravitational constant
    starPullFactor: number;  // Multiplier for star's gravitational effect
    planetPullFactor: number;// Multiplier for planets' gravitational effect
    maxForceMagnitude: number;// Maximum force that can be applied
    minDistanceThreshold: number; // Minimum distance for force calculation
}
```

### 3.2 Default Values
```typescript
const DEFAULT_GRAVITY_SETTINGS: GravitationalSettings = {
    baseGravity: 6.67430e-11,  // Standard gravitational constant
    starPullFactor: 0.5,       // Reduced star pull for playability
    planetPullFactor: 1.0,     // Full planet pull
    maxForceMagnitude: 1000,   // Prevents overwhelming forces
    minDistanceThreshold: 10    // Minimum distance in game units
};
```

## 4. Ship Physics

### 4.1 Force Application
```typescript
interface ShipPhysics {
    position: Vector2D;
    velocity: Vector2D;
    mass: number;        // Base: 100
    thrustForce: number; // Base: 50
    maxSpeed: number;    // Base: 200
}
```

### 4.2 Movement Calculation
```typescript
// For each frame:
1. Calculate total gravitational force from all celestial bodies
2. Apply thrust force if boosting
3. Update velocity: v = v + (F_total / mass) * deltaTime
4. Update position: p = p + v * deltaTime
5. Apply speed limits and boundary checks
```

## 5. Boundary System

### 5.1 Outer Boundary
- Implement a "gravitational well" beyond the outermost planet
- Force increases exponentially with distance from the solar system center
- Direction always points toward the star
- Prevents ships from escaping the playable area

```typescript
function calculateBoundaryForce(shipPosition: Vector2D, boundaryRadius: number): Vector2D {
    const distanceFromCenter = shipPosition.magnitude();
    if (distanceFromCenter > boundaryRadius) {
        const forceMagnitude = Math.pow(distanceFromCenter - boundaryRadius, 2) * BOUNDARY_FORCE_FACTOR;
        return shipPosition.normalize().multiply(-forceMagnitude);
    }
    return new Vector2D(0, 0);
}
```

### 5.2 Inner Boundary
- Prevent ships from entering the star
- Implement collision detection with star's radius
- Apply strong repulsive force near star's surface

## 6. Performance Optimization

### 6.1 Force Calculation Optimization
- Only calculate forces from celestial bodies within gravitational range
- Use spatial partitioning to quickly identify relevant bodies
- Cache force calculations for static bodies
- Implement level of detail system for distant bodies

### 6.2 Update Frequency
- Physics updates: 60 times per second
- Force calculations: Every physics update
- Position updates: Every frame
- Boundary checks: Every physics update

## 7. User Interface

### 7.1 Gravity Controls
- Slider for adjusting base gravitational constant
- Toggle for enabling/disabling star's gravitational effect
- Toggle for enabling/disabling planets' gravitational effects
- Reset button to restore default settings

### 7.2 Visual Feedback
- Trajectory prediction line
- Force vector visualization (optional)
- Gravitational field visualization (optional)
- Boundary warning indicators

## 8. Testing Requirements

### 8.1 Unit Tests
- Force calculation accuracy
- Boundary system effectiveness
- Performance benchmarks
- Settings application

### 8.2 Integration Tests
- Ship movement patterns
- Orbital mechanics
- Collision detection
- Performance under load

### 8.3 Playtesting
- Player control feel
- Difficulty balance
- Settings impact
- Edge case handling

## 9. Implementation Phases

### Phase 1: Core Mechanics
- Basic gravitational force calculation
- Simple ship movement
- Star and planet implementation
- Basic collision detection

### Phase 2: Enhanced Features
- Boundary system
- Settings implementation
- Visual feedback
- Performance optimization

### Phase 3: Polish
- UI controls
- Visual effects
- Performance tuning
- Bug fixes and balance adjustments

## 10. Future Features (v2)

### 10.1 Save/Load System
```typescript
interface GameState {
    player: {
        position: Vector2D;
        velocity: Vector2D;
        money: number;
        inventory: Record<string, number>;
        currentPlanet: string | null;
        shipLevel: number;
    };
    planets: {
        name: string;
        angle: number;
        marketData: Record<string, {
            currentSupplyTons: number;
            productionRate: number;
            consumptionRate: number;
            buyPrice: number;
            sellPrice: number;
        }>;
    }[];
    events: {
        history: Array<{
            timestamp: number;
            message: string;
            eventId: string;
            eventName: string;
            eventType: string;
            scope: string;
            location: string;
            status: string;
        }>;
        activeEvents: Array<{
            eventId: string;
            targetPlanet: string | null;
            startTime: number;
            durationFrames: number;
            remainingFrames: number;
        }>;
    };
    settings: {
        gravity: number;
        timeScale: number;
        eventFrequency: number;
    };
}

// Save format will be JSON
const saveGame = (state: GameState): string => {
    return JSON.stringify(state);
};

const loadGame = (saveData: string): GameState => {
    return JSON.parse(saveData);
};
```

### 10.2 Storage Considerations
- Local storage for browser-based saves
- Export/Import functionality for sharing saves
- Auto-save feature (optional)
- Save file versioning
- Save file validation 