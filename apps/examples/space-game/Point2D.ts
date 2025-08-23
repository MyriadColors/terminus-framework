/**
 * An interface representing a 2D point with x and y coordinates.
 * This interface provides a type definition for objects that can be used
 * interchangeably with Point2D instances, enabling better interoperability
 * with external APIs, plain objects, and other coordinate systems.
 *
 * @example
 * ```typescript
 * // Using PointLike with Point2D methods
 * const point = new Point2D(3, 4);
 * const plainObject: PointLike = { x: 1, y: 2 };
 * const result = point.add(plainObject); // Now supports PointLike directly
 *
 * // Function accepting PointLike
 * function processPoint(point: PointLike): void {
 *     console.log(`Processing point at (${point.x}, ${point.y})`);
 * }
 *
 * processPoint(point);     // Point2D instance
 * processPoint(plainObject); // Plain object
 * ```
 */
export interface PointLike {
  x: number;
  y: number;
}

/**
 * A 2D point class that represents a point in a two-dimensional Cartesian coordinate system.
 *
 * The Point2D class provides immutable 2D point operations and calculations commonly used in
 * computer graphics, game development, physics simulations, and geometric computations.
 * Each instance represents a specific location or vector in 2D space defined by x and y coordinates.
 *
 * Key characteristics:
 * - 🛡️ **Worker-Safe**: All operations return new instances, ensuring thread safety in multi-threaded environments
 * - 🔄 **Structured Clone Compatible**: Safe for Web Worker communication via postMessage/JSON
 * - 🔒 **Immutable**: Once created, coordinate values cannot be modified
 * - 🧮 **Mathematical Operations**: Supports vector arithmetic, distance calculations, and geometric transformations
 * - 📏 **Multiple Distance Metrics**: Euclidean, Manhattan, and Chebyshev distance calculations
 * - ⚡ **Vector Operations**: Dot product, magnitude, normalization, and scaling
 * - 🛠️ **Utility Methods**: String representation and coordinate extraction
 *
 * Thread Safety Guarantees:
 * - All methods return new Point2D instances, never `this`
 * - No shared state between instances
 * - Safe for use in Web Workers and multi-threaded environments
 * - Compatible with structured clone algorithm (postMessage, JSON serialization)
 *
 * Common use cases:
 * - Representing positions of game objects in 2D space
 * - Calculating distances between objects or points
 * - Performing vector-based movement and physics calculations
 * - Geometric computations in graphics and animation systems
 * - Pathfinding algorithms and spatial reasoning
 * - Safe communication between Web Workers via postMessage
 *
 * @example
 * ```typescript
 * // Create points
 * const origin = Point2D.ZERO;
 * const point = new Point2D(3, 4);
 *
 * // Vector operations (all return new instances)
 * const moved = point.add(new Point2D(1, 2));      // Point2D instance
 * const movedFromObject = point.add({ x: 1, y: 2 }); // PointLike object - now supported!
 * const scaled = point.scale(2);
 *
 * // Distance calculations
 * const distance = point.euclideanDistance(origin);        // Point2D instance
 * const distanceFromObject = point.euclideanDistance({ x: 0, y: 0 }); // PointLike object - now supported!
 * const manhattan = point.manhattanDistance(origin);
 *
 * // Vector properties
 * const length = point.magnitude();
 * const unitVector = point.normalize();
 *
 * // Floating-point equality with epsilon tolerance
 * const point1 = new Point2D(1.0000001, 2.0000001);
 * const point2 = new Point2D(1, 2);
 * console.log(point1.equals(point2));        // false (strict equality)
 * console.log(point1.equals(point2, 0.001)); // true (with epsilon tolerance)
 *
 * // Worker-safe serialization
 * const worker = new Worker('worker.js');
 * worker.postMessage(point.toJSON());
 * // In worker:
 * const revived = Point2D.revive(event.data);
 * ```
 */
export class Point2D {
  /**
   * The x-coordinate of the point in 2D space.
   * This value is immutable after the point is created.
   */
  readonly x: number;

  /**
   * The y-coordinate of the point in 2D space.
   * This value is immutable after the point is created.
   */
  readonly y: number;

  /**
   * A static constant representing the origin point (0, 0) in 2D space.
   * Useful for calculations involving the origin, zero vectors, or as a default starting point.
   */
  static readonly ZERO = new Point2D(0, 0);

  /**
   * A static constant representing the point (1, 1) in 2D space.
   * Useful for unit scaling operations, vector multiplication, or as a default unit point.
   */
  static readonly ONE = new Point2D(1, 1);

  /**
   * A static constant representing a unit vector along the positive x-axis (1, 0).
   * Useful for representing horizontal directions, rightward movement, or x-axis alignment.
   */
  static readonly X_AXIS = new Point2D(1, 0);

  /**
   * A static constant representing a unit vector along the positive y-axis (0, 1).
   * Useful for representing vertical directions, upward movement, or y-axis alignment.
   */
  static readonly Y_AXIS = new Point2D(0, 1);

  /**
   * Creates a new Point2D instance from a PointLike object.
   *
   * @param obj - The object containing x and y coordinates.
   * @returns A new Point2D instance with the coordinates from the input object.
   *
   * This static method provides a convenient way to create Point2D instances from
   * plain objects, JSON data, or any object that implements the PointLike interface.
   * It is the inverse operation of the toJSON() method.
   *
   * This method is useful for:
   * - Deserializing point data from JSON APIs or local storage
   * - Converting between different coordinate representations
   * - Creating points from user input or external data sources
   * - Working with data from third-party libraries
   *
   * @example
   * ```typescript
   * // Create from a plain object
   * const plainObj = { x: 3, y: 4 };
   * const point = Point2D.fromObject(plainObj);
   * console.log(point.toString()); // Output: "(3, 4)"
   *
   * // Create from JSON data
   * const jsonData = JSON.parse('{"x": 5, "y": -2}');
   * const fromJson = Point2D.fromObject(jsonData);
   * console.log(fromJson.toString()); // Output: "(5, -2)"
   *
   * // Works with any PointLike object
   * const pointLike = { x: 1.5, y: 2.5 };
   * const converted = Point2D.fromObject(pointLike);
   * console.log(converted.toString()); // Output: "(1.5, 2.5)"
   * ```
   */
  static fromObject(obj: PointLike): Point2D {
    return new Point2D(obj.x, obj.y);
  }

  /**
   * Static utility function to add two points without creating intermediate Point2D instances.
   * Optimized for performance-critical scenarios.
   *
   * @param p1 - First point as PointLike object.
   * @param p2 - Second point as PointLike object.
   * @returns A new Point2D instance representing the sum.
   *
   * This static method provides better performance than calling add() on Point2D instances
   * when working with large numbers of points, as it avoids the overhead of method calls
   * on Point2D objects. It operates directly on coordinate objects.
   *
   * @example
   * ```typescript
   * const point1 = { x: 3, y: 4 };
   * const point2 = { x: 1, y: 2 };
   * const result = Point2D.add(point1, point2);
   * console.log(result.toString()); // Output: "(4, 6)"
   * ```
   */
  static add(p1: PointLike, p2: PointLike): Point2D {
    return new Point2D(p1.x + p2.x, p1.y + p2.y);
  }

  /**
   * Static utility function to subtract two points without creating intermediate Point2D instances.
   * Optimized for performance-critical scenarios.
   *
   * @param p1 - First point as PointLike object.
   * @param p2 - Second point as PointLike object.
   * @returns A new Point2D instance representing the difference.
   *
   * This static method provides better performance than calling subtract() on Point2D instances
   * when working with large numbers of points. It operates directly on coordinate objects.
   *
   * @example
   * ```typescript
   * const point1 = { x: 5, y: 7 };
   * const point2 = { x: 2, y: 3 };
   * const result = Point2D.subtract(point1, point2);
   * console.log(result.toString()); // Output: "(3, 4)"
   * ```
   */
  static subtract(p1: PointLike, p2: PointLike): Point2D {
    return new Point2D(p1.x - p2.x, p1.y - p2.y);
  }

  /**
   * Static utility function to scale a point without creating intermediate Point2D instances.
   * Optimized for performance-critical scenarios.
   *
   * @param point - Point to scale as PointLike object.
   * @param factor - Scaling factor.
   * @returns A new Point2D instance with scaled coordinates.
   *
   * This static method provides better performance than calling scale() on Point2D instances
   * when working with large numbers of points. It operates directly on coordinate objects.
   *
   * @example
   * ```typescript
   * const point = { x: 3, y: 4 };
   * const result = Point2D.scale(point, 2);
   * console.log(result.toString()); // Output: "(6, 8)"
   * ```
   */
  static scale(point: PointLike, factor: number): Point2D {
    return new Point2D(point.x * factor, point.y * factor);
  }

  /**
   * Static utility function to calculate Euclidean distance between two points.
   * Optimized for performance-critical scenarios.
   *
   * @param p1 - First point as PointLike object.
   * @param p2 - Second point as PointLike object.
   * @returns The Euclidean distance between the points.
   *
   * This static method provides better performance than calling euclideanDistance() on Point2D instances
   * when working with large numbers of points. It operates directly on coordinate objects.
   *
   * @example
   * ```typescript
   * const point1 = { x: 3, y: 4 };
   * const point2 = { x: 0, y: 0 };
   * const distance = Point2D.distance(point1, point2);
   * console.log(distance); // Output: 5
   * ```
   */
  static distance(p1: PointLike, p2: PointLike): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Creates a new 2D point with the specified x and y coordinates.
   *
   * @param x - The x-coordinate of the point. Can be any number, including negative values.
   * @param y - The y-coordinate of the point. Can be any number, including negative values.
   *
   * @example
   * ```typescript
   * // Create a point at (3, 4)
   * const point = new Point2D(3, 4);
   *
   * // Create a point at the origin
   * const origin = new Point2D(0, 0);
   *
   * // Create a point with negative coordinates
   * const negativePoint = new Point2D(-2, -5);
   * ```
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns a string representation of the point in the format "(x, y)".
   *
   * @returns A string containing the point's coordinates formatted as "(x, y)", where x and y are the
   * respective coordinate values. This provides a human-readable representation of the point that is
   * useful for debugging, logging, or displaying point information to users.
   *
   * @example
   * ```typescript
   * const point = new Point2D(3, 4);
   * console.log(point.toString()); // Output: "(3, 4)"
   *
   * const origin = Point2D.ZERO;
   * console.log(origin.toString()); // Output: "(0, 0)"
   * ```
   */
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  /**
   * Returns the coordinates of the point as an object with x and y properties.
   *
   * @returns An object containing the x and y coordinates of the point. The returned object
   * has the structure `{ x: number; y: number }` where x and y represent the respective
   * coordinate values of this point. This method provides a convenient way to extract
   * both coordinates simultaneously or to pass point data to functions that expect
   * coordinate objects rather than Point2D instances.
   *
   * @example
   * ```typescript
   * const point = new Point2D(3, 4);
   * const coords = point.getCoordinates();
   * console.log(coords); // Output: { x: 3, y: 4 }
   * console.log(coords.x); // Output: 3
   * console.log(coords.y); // Output: 4
   * ```
   */
  getCoordinates(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Serializes this point to a JSON-compatible object.
   *
   * @returns An object with x and y properties that can be serialized to JSON.
   *
   * This method provides a standardized way to convert a Point2D instance to a plain
   * object that can be easily serialized for storage, transmission, or debugging.
   * The returned object follows the PointLike interface structure.
   *
   * This is particularly useful for:
   * - Saving point data to local storage or databases
   * - Sending point data over APIs or web sockets
   * - Debugging and logging point information
   * - Converting between different coordinate representations
   *
   * @example
   * ```typescript
   * const point = new Point2D(3, 4);
   * const jsonData = point.toJSON();
   * console.log(jsonData); // Output: { x: 3, y: 4 }
   *
   * // Can be easily stringified
   * const jsonString = JSON.stringify(point);
   * console.log(jsonString); // Output: '{"x":3,"y":4}'
   *
   * // Can be restored using fromObject
   * const restored = Point2D.fromObject(jsonData);
   * console.log(restored.toString()); // Output: "(3, 4)"
   * ```
   */
  toJSON(): PointLike {
    return { x: this.x, y: this.y };
  }

  /**
   * Static method to revive a Point2D instance from a plain object or JSON.
   * This method provides structured clone compatibility, allowing Point2D instances
   * to be safely reconstructed after being serialized via JSON.stringify/postMessage.
   *
   * @param obj - The object containing x and y coordinates to revive.
   * @returns A new Point2D instance with the coordinates from the input object.
   * @throws {Error} If the input object is invalid or missing required properties.
   *
   * This method is particularly useful for:
   * - Reconstructing Point2D instances in Web Workers after postMessage
   * - Deserializing point data from JSON APIs or local storage
   * - Converting between different coordinate representations while preserving methods
   *
   * @example
   * ```typescript
   * // Serialize and revive in main thread
   * const original = new Point2D(3, 4);
   * const json = JSON.stringify(original);
   * const parsed = JSON.parse(json);
   * const revived = Point2D.revive(parsed);
   * console.log(revived.toString()); // Output: "(3, 4)"
   * console.log(revived instanceof Point2D); // Output: true
   *
   * // Use with Web Workers
   * const worker = new Worker('worker.js');
   * worker.postMessage(original.toJSON());
   * // In worker:
   * const revived = Point2D.revive(event.data);
   * ```
   */
  static revive(obj: any): Point2D {
    if (!obj || typeof obj !== "object") {
      throw new Error("Point2D.revive: Input must be an object");
    }
    if (typeof obj.x !== "number" || typeof obj.y !== "number") {
      throw new Error(
        "Point2D.revive: Input must have numeric x and y properties"
      );
    }
    return new Point2D(obj.x, obj.y);
  }

  /**
   * Adds the coordinates of another point to the current point, creating a new point.
   *
   * @param point - The point to add to the current point. The x and y coordinates of this point
   * will be added to the corresponding coordinates of the current point.
   * @returns A new Point2D instance representing the sum of the current point and the given point.
   * The resulting point has coordinates (this.x + point.x, this.y + point.y).
   *
   * This method performs vector addition, which is useful for:
   * - Moving objects by a displacement vector
   * - Combining multiple position offsets
   * - Adding velocity vectors to position vectors
   * - Translating points in 2D space
   *
   * @example
   * ```typescript
   * const point1 = new Point2D(3, 4);
   * const point2 = new Point2D(1, 2);
   * const result = point1.add(point2);
   * console.log(result.toString()); // Output: "(4, 6)"
   * ```
   */
  add(point: PointLike): Point2D {
    return new Point2D(this.x + point.x, this.y + point.y);
  }

  /**
   * Subtracts the coordinates of another point from the current point, creating a new point.
   *
   * @param point - The point to subtract from the current point. The x and y coordinates of this point
   * will be subtracted from the corresponding coordinates of the current point.
   * @returns A new Point2D instance representing the difference between the current point and the given point.
   * The resulting point has coordinates (this.x - point.x, this.y - point.y).
   *
   * This method performs vector subtraction, which is useful for:
   * - Calculating displacement vectors between two points
   * - Finding relative positions between objects
   * - Computing direction vectors from one point to another
   * - Determining offset distances in 2D space
   *
   * @example
   * ```typescript
   * const point1 = new Point2D(5, 7);
   * const point2 = new Point2D(2, 3);
   * const result = point1.subtract(point2);
   * console.log(result.toString()); // Output: "(3, 4)"
   * ```
   */
  subtract(point: PointLike): Point2D {
    return new Point2D(this.x - point.x, this.y - point.y);
  }

  /**
   * Scales the current point by a given factor, creating a new point with scaled coordinates.
   *
   * @param factor - The scaling factor to apply to both x and y coordinates. A factor of 1 returns
   * an equivalent point, values greater than 1 increase the magnitude, values between 0 and 1 decrease
   * the magnitude, negative values flip the direction, and 0 results in the origin point.
   * @returns A new Point2D instance with coordinates scaled by the given factor.
   * The resulting point has coordinates (this.x * factor, this.y * factor).
   *
   * This method performs uniform scaling, which is useful for:
   * - Resizing objects or sprites in games
   * - Adjusting vector magnitudes while preserving direction
   * - Creating zoom effects in graphics applications
   * - Scaling displacement vectors for movement calculations
   * - Converting between different coordinate systems or units
   *
   * @example
   * ```typescript
   * const point = new Point2D(3, 4);
   * const doubled = point.scale(2);
   * console.log(doubled.toString()); // Output: "(6, 8)"
   *
   * const halved = point.scale(0.5);
   * console.log(halved.toString()); // Output: "(1.5, 2)"
   *
   * const flipped = point.scale(-1);
   * console.log(flipped.toString()); // Output: "(-3, -4)"
   * ```
   */
  scale(factor: number): Point2D {
    return new Point2D(this.x * factor, this.y * factor);
  }

  /**
   * Calculates the Euclidean distance between the current point and another point.
   *
   * @param point - The other point to calculate the distance to.
   * @returns The Euclidean distance between the current point and the given point.
   *
   * The Euclidean distance is the straight-line distance between two points in Euclidean space.
   * It is calculated using the Pythagorean theorem, which states that in a right-angled triangle,
   * the square of the length of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the lengths of the other two sides.
   *
   * In this case, the Euclidean distance is calculated using the formula:
   * sqrt((x2 - x1)^2 + (y2 - y1)^2), where (x1, y1) and (x2, y2) are the coordinates of the current point and the given point, respectively.
   *
   * The result is rounded to the nearest integer using `Math.fround`.
   */
  euclideanDistance(point: PointLike): number {
    const dx = this.x - point.x;
    const dy = this.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the Manhattan distance between the current point and another point.
   *
   * @param point - The other point to calculate the distance to.
   * @returns The Manhattan distance between the current point and the given point.
   *
   * The Manhattan distance, also known as taxicab distance or L1 distance, is the sum of the absolute differences
   * of their Cartesian coordinates. It represents the distance between two points measured along axes at right angles.
   * In a grid-based system, it's the minimum number of moves required to get from one point to another if you can
   * only move horizontally or vertically (like a taxi navigating city blocks).
   *
   * The Manhattan distance is calculated using the formula:
   * |x2 - x1| + |y2 - y1|, where (x1, y1) and (x2, y2) are the coordinates of the current point and the given point, respectively.
   */
  manhattanDistance(point: PointLike): number {
    return Math.abs(this.x - point.x) + Math.abs(this.y - point.y);
  }

  /**
   * Calculates the Chebyshev distance between the current point and another point.
   *
   * @param point - The other point to calculate the distance to.
   * @returns The Chebyshev distance between the current point and the given point.
   *
   * The Chebyshev distance, also known as L∞ distance or chessboard distance, is the maximum of the absolute
   * differences of their Cartesian coordinates. It represents the minimum number of moves required for a king
   * to move from one square to another on a chessboard, where the king can move one square in any direction
   * (horizontally, vertically, or diagonally).
   *
   * The Chebyshev distance is calculated using the formula:
   * max(|x2 - x1|, |y2 - y1|), where (x1, y1) and (x2, y2) are the coordinates of the current point and the given point, respectively.
   */
  chebyshevDistance(point: PointLike): number {
    const dx = Math.abs(this.x - point.x);
    const dy = Math.abs(this.y - point.y);
    return Math.max(dx, dy);
  }

  /**
   * Calculates the dot product between the current point and another point.
   *
   * @param point - The other point to calculate the dot product with.
   * @returns The dot product of the current point and the given point.
   *
   * The dot product (also known as scalar product) is a mathematical operation that takes two vectors
   * and returns a single scalar value. For 2D points treated as vectors, it is calculated as:
   * (x1 * x2) + (y1 * y2), where (x1, y1) and (x2, y2) are the coordinates of the current point
   * and the given point, respectively.
   *
   * The dot product has several geometric interpretations:
   * - If the result is positive, the vectors point in generally the same direction
   * - If the result is zero, the vectors are perpendicular (orthogonal)
   * - If the result is negative, the vectors point in generally opposite directions
   * - The magnitude of the result relates to how aligned the vectors are
   */
  dotProduct(point: PointLike): number {
    return this.x * point.x + this.y * point.y;
  }

  /**
   * Calculates the magnitude (length) of the vector represented by this point.
   *
   * @returns The magnitude of the vector as a number.
   *
   * The magnitude of a vector is its length in Euclidean space, calculated using the Pythagorean theorem.
   * For a 2D vector with components (x, y), the magnitude is calculated as:
   * sqrt(x^2 + y^2)
   *
   * This represents the distance from the origin (0, 0) to the point (x, y).
   * The magnitude is always a non-negative value, with 0 indicating the vector is at the origin.
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalizes the current point to create a unit vector with magnitude 1.
   *
   * @returns A new Point2D representing the normalized vector. If the current point is at the origin (0, 0),
   * returns a new Point2D at (0, 0) to avoid division by zero.
   *
   * Normalization converts a vector to a unit vector that points in the same direction but has a magnitude of 1.
   * This is useful for representing direction without magnitude, such as for movement directions or surface normals.
   * The normalized vector is calculated by dividing each component by the vector's magnitude.
   *
   * Special case: If the magnitude is 0 (meaning the point is at the origin), the function returns (0, 0)
   * since there is no meaningful direction to normalize.
   */
  normalize(): Point2D {
    const magnitude = this.magnitude();
    if (magnitude === 0) {
      return Point2D.ZERO;
    }
    return this.scale(1 / magnitude);
  }

  /**
   * Checks if this point is equal to another point by comparing coordinates.
   *
   * @param point - The point to compare with this point.
   * @returns True if both points have the same x and y coordinates, false otherwise.
   *
   * This method performs a strict equality comparison of the x and y coordinates.
   * It is useful for determining if two points represent the same location in 2D space.
   * For floating-point comparisons, consider using a small epsilon tolerance if needed.
   *
   * @example
   * ```typescript
   * const point1 = new Point2D(3, 4);
   * const point2 = new Point2D(3, 4);
   * const point3 = new Point2D(3, 5);
   * console.log(point1.equals(point2)); // Output: true
   * console.log(point1.equals(point3)); // Output: false
   * ```
   */
  equals(point: PointLike, epsilon = 0): boolean {
    return (
      Math.abs(this.x - point.x) <= epsilon &&
      Math.abs(this.y - point.y) <= epsilon
    );
  }

  /**
   * Calculates the 2D scalar cross product between this point and another point.
   *
   * @param point - The point to calculate the cross product with.
   * @returns The scalar cross product value (x1*y2 - y1*x2).
   *
   * In 2D, the cross product is a scalar value that represents the signed area of the parallelogram
   * formed by the two vectors. It is useful for:
   * - Determining the orientation of three points (clockwise, counter-clockwise, or collinear)
   * - Computing the sine of the angle between two vectors
   * - Finding perpendicular vectors
   * - Determining left or right turns in pathfinding algorithms
   *
   * A positive result indicates counter-clockwise orientation, negative indicates clockwise,
   * and zero indicates the vectors are collinear.
   *
   * @example
   * ```typescript
   * const point1 = new Point2D(3, 4);
   * const point2 = new Point2D(1, 2);
   * const cross = point1.crossProduct(point2);
   * console.log(cross); // Output: 3*2 - 4*1 = 2
   * ```
   */
  crossProduct(point: PointLike): number {
    return this.x * point.y - this.y * point.x;
  }

  /**
   * Calculates the angle of this vector in radians relative to the positive x-axis.
   *
   * @returns The angle in radians between -π and π.
   *
   * The angle is calculated using Math.atan2(y, x), which returns the angle in radians
   * between the positive x-axis and the vector (x, y). This method is useful for:
   * - Determining the direction of a vector
   * - Converting between Cartesian and polar coordinates
   * - Rotating objects to face specific directions
   * - Calculating relative angles between vectors
   *
   * The result ranges from -π (pointing left along the negative x-axis) to π
   * (also pointing left along the negative x-axis), passing through 0 (pointing
   * right along the positive x-axis) and π/2 (pointing up along the positive y-axis).
   *
   * @example
   * ```typescript
   * const right = new Point2D(1, 0);
   * const up = new Point2D(0, 1);
   * const left = new Point2D(-1, 0);
   * const down = new Point2D(0, -1);
   * console.log(right.angle()); // Output: 0
   * console.log(up.angle());    // Output: π/2 ≈ 1.5708
   * console.log(left.angle());  // Output: π ≈ 3.1416
   * console.log(down.angle());  // Output: -π/2 ≈ -1.5708
   * ```
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Calculates the angle between this vector and another vector in radians.
   *
   * @param point - The other vector to calculate the angle with.
   * @returns The angle in radians between 0 and π.
   *
   * This method computes the smallest angle between two vectors using the dot product formula:
   * angle = arccos((v1 · v2) / (|v1| |v2|))
   * The result is always between 0 and π radians (0° to 180°), representing the smallest
   * angle between the two vectors regardless of their direction.
   *
   * Special cases:
   * - If either vector has zero magnitude, returns 0
   * - If the vectors point in the same direction, returns 0
   * - If the vectors point in opposite directions, returns π
   *
   * This method is useful for:
   * - Determining how aligned two vectors are
   * - Computing relative orientations between objects
   * - Physics simulations involving angular relationships
   * - Game AI for field of view calculations
   *
   * @example
   * ```typescript
   * const vector1 = new Point2D(1, 0);
   * const vector2 = new Point2D(0, 1);
   * const vector3 = new Point2D(-1, 0);
   * console.log(vector1.angleBetween(vector2)); // Output: π/2 ≈ 1.5708 (90 degrees)
   * console.log(vector1.angleBetween(vector3)); // Output: π ≈ 3.1416 (180 degrees)
   * console.log(vector1.angleBetween(vector1)); // Output: 0 (same direction)
   * ```
   */
  angleBetween(point: PointLike): number {
    const point2D =
      point instanceof Point2D ? point : Point2D.fromObject(point);
    const dot = this.dotProduct(point);
    const mag = this.magnitude() * point2D.magnitude();
    return mag === 0 ? 0 : Math.acos(dot / mag);
  }

  /**
   * Rotates this point around the origin or a specified center point by a given angle.
   *
   * @param angle - The rotation angle in radians. Positive values rotate counter-clockwise,
   * negative values rotate clockwise.
   * @param origin - The center point to rotate around. Defaults to the origin (0, 0).
   * @returns A new Point2D instance representing the rotated point.
   *
   * This method uses the 2D rotation matrix to transform the point. The rotation is performed
   * using the standard rotation formulas:
   * x' = x * cos(angle) - y * sin(angle)
   * y' = x * sin(angle) + y * cos(angle)
   *
   * When rotating around a custom origin, the point is first translated to be relative
   * to the origin, then rotated, then translated back.
   *
   * This method is useful for:
   * - Rotating game objects and sprites
   * - Implementing camera systems
   * - Creating circular motion patterns
   * - Transforming coordinate systems
   * - Implementing physics simulations with rotation
   *
   * @example
   * ```typescript
   * const point = new Point2D(1, 0);
   *
   * // Rotate 90 degrees counter-clockwise around origin
   * const rotated90 = point.rotate(Math.PI / 2);
   * console.log(rotated90.toString()); // Output: "(0, 1)"
   *
   * // Rotate 180 degrees around origin
   * const rotated180 = point.rotate(Math.PI);
   * console.log(rotated180.toString()); // Output: "(-1, 0)"
   *
   * // Rotate around a custom center
   * const center = new Point2D(1, 1);
   * const aroundCenter = point.rotate(Math.PI / 4, center);
   * console.log(aroundCenter.toString()); // Output depends on the specific calculation
   * ```
   */
  rotate(angle: number, origin: PointLike = Point2D.ZERO): Point2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = this.x - origin.x;
    const dy = this.y - origin.y;
    return new Point2D(
      origin.x + dx * cos - dy * sin,
      origin.y + dx * sin + dy * cos
    );
  }

  /**
   * Projects this vector onto another vector, returning the projection vector.
   *
   * @param point - The vector to project onto.
   * @returns A new Point2D instance representing the projection of this vector onto the given vector.
   *
   * Vector projection finds the component of this vector that points in the same direction
   * as the given vector. The projection is calculated using the formula:
   * proj = (v1 · v2 / |v2|²) * v2
   * where v1 is this vector and v2 is the vector to project onto.
   *
   * The projection vector represents the "shadow" or component of this vector that
   * lies along the direction of the given vector.
   *
   * Special cases:
   * - If the vector to project onto has zero magnitude, returns (0, 0)
   * - If the vectors are parallel, returns the original vector (scaled appropriately)
   * - If the vectors are perpendicular, returns (0, 0)
   *
   * This method is useful for:
   * - Physics simulations involving forces and motion
   * - Computer graphics for lighting and shading calculations
   * - Game development for movement along surfaces
   * - Data analysis and machine learning algorithms
   * - Collision detection and response
   *
   * @example
   * ```typescript
   * const vector1 = new Point2D(3, 4);
   * const vector2 = new Point2D(1, 0); // Unit vector along x-axis
   * const projection = vector1.projectOnto(vector2);
   * console.log(projection.toString()); // Output: "(3, 0)" - only the x-component
   *
   * const vector3 = new Point2D(2, 2);
   * const vector4 = new Point2D(0, 1); // Unit vector along y-axis
   * const yProjection = vector3.projectOnto(vector4);
   * console.log(yProjection.toString()); // Output: "(0, 2)" - only the y-component
   *
   * const diagonal = new Point2D(1, 1);
   * const ontoDiagonal = vector1.projectOnto(diagonal);
   * console.log(ontoDiagonal.toString()); // Output: "(3.5, 3.5)" - projection onto diagonal
   * ```
   */
  projectOnto(point: PointLike): Point2D {
    if (point.x === 0 && point.y === 0) return Point2D.ZERO;
    const point2D =
      point instanceof Point2D ? point : Point2D.fromObject(point);
    const scalar = this.dotProduct(point) / point2D.dotProduct(point2D);
    return point2D.scale(scalar);
  }

  /**
   * Limits the magnitude of this vector to a maximum value.
   * If the vector's magnitude exceeds the maximum, it is scaled down to the maximum magnitude
   * while preserving its direction. If the magnitude is already within the limit, the vector
   * is returned unchanged.
   *
   * @param max - The maximum allowed magnitude. Must be a non-negative number.
   * @returns A new Point2D instance with magnitude limited to the specified maximum.
   *
   * This method is particularly useful in physics simulations and game development where
   * you need to constrain velocities, forces, or other vector quantities to prevent
   * unrealistic behavior or instability.
   *
   * The method works by:
   * 1. Calculating the current magnitude of the vector
   * 2. If magnitude ≤ max, return the original vector
   * 3. If magnitude > max, normalize the vector and scale it by max
   *
   * Special cases:
   * - If max is 0, returns (0, 0) (the origin)
   * - If the vector has zero magnitude, returns (0, 0) regardless of max
   * - If max is negative, treats it as 0 (returns origin)
   *
   * This method is useful for:
   * - Physics simulations with velocity limits
   * - Game development for character movement speed control
   * - Particle systems with constrained particle velocities
   * - Animation systems with limited movement speeds
   * - AI movement with maximum speed constraints
   * - Preventing numerical instability in simulations
   *
   * @example
   * ```typescript
   * const fastVector = new Point2D(5, 5); // Magnitude ≈ 7.07
   * const limited = fastVector.limit(5);
   * console.log(limited.toString()); // Output: "(3.535, 3.535)" - magnitude ≈ 5
   *
   * const slowVector = new Point2D(1, 1); // Magnitude ≈ 1.414
   * const stillLimited = slowVector.limit(5);
   * console.log(stillLimited.toString()); // Output: "(1, 1)" - unchanged
   *
   * const zeroVector = new Point2D(0, 0);
   * const zeroLimited = zeroVector.limit(10);
   * console.log(zeroLimited.toString()); // Output: "(0, 0)"
   *
   * const negativeMax = new Point2D(3, 4);
   * const negativeLimited = negativeVector.limit(-1);
   * console.log(negativeLimited.toString()); // Output: "(0, 0)"
   * ```
   */
  limit(max: number): Point2D {
    const mag = this.magnitude();
    if (mag === 0 || max <= 0) return Point2D.ZERO;
    if (mag <= max) return new Point2D(this.x, this.y);
    return this.normalize().scale(max);
  }
}

/**
 * A high-performance utility for zero-copy sharing of 2D points between threads
 * using SharedArrayBuffer. This class provides mutable access to point coordinates
 * with atomic operations for thread safety.
 *
 * Key characteristics:
 * - Zero-copy sharing: Points are stored in typed arrays for efficient transfer
 * - Atomic operations: Thread-safe coordinate access using Atomics
 * - Mutable design: Coordinates can be modified directly (unlike Point2D)
 * - Factory pattern: Easy creation of different buffer types
 *
 * Thread Safety Considerations:
 * - This class is mutable by design
 * - Multiple threads can modify the same buffer coordinates
 * - Atomic operations ensure individual coordinate access is thread-safe
 * - Complex operations require external synchronization
 *
 * Performance Benefits:
 * - No garbage collection overhead
 * - Direct memory access
 * - Efficient transfer between threads via postMessage
 * - Batch operations for multiple points
 *
 * Common use cases:
 * - Physics simulations in Web Workers
 * - Real-time graphics rendering
 * - High-performance game engines
 * - Data processing pipelines
 *
 * @example
 * ```typescript
 * // Create a shared buffer for 1000 points
 * const buffer = PointBuffer.shared(1000);
 *
 * // Set a point's coordinates
 * buffer.index = 42;
 * buffer.x = 10.5;
 * buffer.y = 20.3;
 *
 * // Atomic access in multi-threaded environments
 * const x = buffer.atomicGetX();
 * const y = buffer.atomicGetY();
 *
 * // Convert to immutable Point2D
 * const point = buffer.toPoint2D();
 *
 * // Batch operations
 * const result = buffer.add(otherBuffer);
 * ```
 */
export class PointBuffer {
  /**
   * Creates a new PointBuffer instance.
   * @param buffer - The Float32Array containing point data
   * @param intBuffer - The Int32Array for atomic operations (dual-view approach)
   * @param index - The starting index in the buffer for this point
   * @param shared - Whether the buffer uses SharedArrayBuffer
   * @private
   */
  private constructor(
    private buffer: Float32Array,
    private intBuffer: Int32Array,
    private index: number,
    private shared: boolean = false
  ) {
    if (index < 0 || index >= buffer.length) {
      throw new Error(
        `PointBuffer: Index ${index} is out of bounds for buffer of length ${buffer.length}`
      );
    }
  }

  /**
   * Factory method to create a regular (non-shared) PointBuffer.
   * @param size - Number of points to allocate in the buffer
   * @returns A new PointBuffer instance
   */
  static create(size: number): PointBuffer {
    if (size <= 0) {
      throw new Error("PointBuffer.create: Size must be positive");
    }
    const buffer = new Float32Array(size * 2); // 2 floats per point (x, y)
    const intBuffer = new Int32Array(buffer.buffer);
    return new PointBuffer(buffer, intBuffer, 0);
  }

  /**
   * Factory method to create a shared PointBuffer using SharedArrayBuffer.
   * @param size - Number of points to allocate in the buffer
   * @returns A new PointBuffer instance using SharedArrayBuffer
   * @throws {Error} If SharedArrayBuffer is not supported
   */
  static shared(size: number): PointBuffer {
    if (typeof SharedArrayBuffer === "undefined") {
      throw new Error(
        "PointBuffer.shared: SharedArrayBuffer is not supported in this environment"
      );
    }
    if (size <= 0) {
      throw new Error("PointBuffer.shared: Size must be positive");
    }
    const buffer = new SharedArrayBuffer(
      size * 2 * Int32Array.BYTES_PER_ELEMENT
    );
    const array = new Float32Array(buffer);
    const intArray = new Int32Array(buffer);
    return new PointBuffer(array, intArray, 0, true);
  }

  /**
   * Creates a PointBuffer from an existing Float32Array buffer.
   * @param buffer - The existing Float32Array containing point data
   * @param index - The starting index in the buffer for this point
   * @returns A new PointBuffer instance
   */
  static fromBuffer(buffer: Float32Array, index: number = 0): PointBuffer {
    const intBuffer = new Int32Array(buffer.buffer);
    return new PointBuffer(buffer, intBuffer, index);
  }

  /**
   * Gets the x-coordinate of the point.
   */
  get x(): number {
    return this.buffer[this.index];
  }

  /**
   * Sets the x-coordinate of the point.
   */
  set x(value: number) {
    this.buffer[this.index] = value;
  }

  /**
   * Gets the y-coordinate of the point.
   */
  get y(): number {
    return this.buffer[this.index + 1];
  }

  /**
   * Sets the y-coordinate of the point.
   */
  set y(value: number) {
    this.buffer[this.index + 1] = value;
  }

  /**
   * Atomically gets the x-coordinate of the point.
   * Only works with shared buffers.
   * @returns The x-coordinate
   */
  atomicGetX(): number {
    if (!this.shared) {
      return this.x;
    }
    return Number(Atomics.load(this.intBuffer, this.index));
  }

  /**
   * Atomically gets the y-coordinate of the point.
   * Only works with shared buffers.
   * @returns The y-coordinate
   */
  atomicGetY(): number {
    if (!this.shared) {
      return this.y;
    }
    return Number(Atomics.load(this.intBuffer, this.index + 1));
  }

  /**
   * Atomically sets the x-coordinate of the point.
   * Only works with shared buffers.
   * @param value - The value to set
   */
  atomicSetX(value: number): void {
    if (!this.shared) {
      this.x = value;
      return;
    }
    Atomics.store(this.intBuffer, this.index, value);
  }

  /**
   * Atomically sets the y-coordinate of the point.
   * Only works with shared buffers.
   * @param value - The value to set
   */
  atomicSetY(value: number): void {
    if (!this.shared) {
      this.y = value;
      return;
    }
    Atomics.store(this.intBuffer, this.index + 1, value);
  }

  /**
   * Adds another point buffer to this one, creating a new result buffer.
   * @param other - The other PointBuffer to add
   * @returns A new PointBuffer with the result
   */
  add(other: PointBuffer): PointBuffer {
    if (this.shared || other.shared) {
      throw new Error(
        "PointBuffer.add: Cannot perform operations on shared buffers directly. Use atomic operations or convert to regular buffers first."
      );
    }
    const result = PointBuffer.create(1);
    result.x = this.x + other.x;
    result.y = this.y + other.y;
    return result;
  }

  /**
   * Subtracts another point buffer from this one, creating a new result buffer.
   * @param other - The other PointBuffer to subtract
   * @returns A new PointBuffer with the result
   */
  subtract(other: PointBuffer): PointBuffer {
    if (this.shared || other.shared) {
      throw new Error(
        "PointBuffer.subtract: Cannot perform operations on shared buffers directly. Use atomic operations or convert to regular buffers first."
      );
    }
    const result = PointBuffer.create(1);
    result.x = this.x - other.x;
    result.y = this.y - other.y;
    return result;
  }

  /**
   * Scales this point by a factor, creating a new result buffer.
   * @param factor - The scaling factor
   * @returns A new PointBuffer with the scaled result
   */
  scale(factor: number): PointBuffer {
    if (this.shared) {
      throw new Error(
        "PointBuffer.scale: Cannot perform operations on shared buffers directly. Use atomic operations or convert to regular buffers first."
      );
    }
    const result = PointBuffer.create(1);
    result.x = this.x * factor;
    result.y = this.y * factor;
    return result;
  }

  /**
   * Converts this PointBuffer to an immutable Point2D instance.
   * @returns A new Point2D instance with the same coordinates
   */
  toPoint2D(): Point2D {
    return new Point2D(this.x, this.y);
  }

  /**
   * Creates a PointBuffer from a Point2D instance.
   * @param point - The Point2D instance to convert
   * @returns A new PointBuffer with the same coordinates
   */
  static fromPoint2D(point: Point2D): PointBuffer {
    const buffer = PointBuffer.create(1);
    buffer.x = point.x;
    buffer.y = point.y;
    return buffer;
  }

  /**
   * Gets the total number of points that can be stored in this buffer.
   * @returns The size of the buffer in points
   */
  size(): number {
    return this.buffer.length / 2;
  }

  /**
   * Gets the total number of floats in the buffer.
   * @returns The length of the underlying Float32Array
   */
  length(): number {
    return this.buffer.length;
  }

  /**
   * Creates a new PointBuffer view at the specified index.
   * This allows easy iteration over a buffer of multiple points.
   *
   * @param index - The index of the point to create a view for (0-based)
   * @returns A new PointBuffer instance pointing to the specified index
   *
   * @example
   * ```typescript
   * // Create a buffer for 5 points
   * const buffer = PointBuffer.create(5);
   *
   * // Set coordinates for the first point
   * buffer.at(0).x = 10;
   * buffer.at(0).y = 20;
   *
   * // Set coordinates for the third point
   * buffer.at(2).x = 30;
   * buffer.at(2).y = 40;
   *
   * // Iterate over all points
   * for (let i = 0; i < buffer.size(); i++) {
   *   const point = buffer.at(i);
   *   console.log(`Point ${i}: (${point.x}, ${point.y})`);
   * }
   * ```
   */
  at(index: number): PointBuffer {
    if (index < 0 || index >= this.size()) {
      throw new Error(
        `PointBuffer.at: Index ${index} is out of bounds for buffer of size ${this.size()}`
      );
    }
    return new PointBuffer(this.buffer, this.intBuffer, index * 2, this.shared);
  }

  /**
   * Adds all points from buffer b to buffer a, storing the result in buffer out.
   * This is a performance-optimized batch operation.
   *
   * @param a - The first PointBuffer (addend)
   * @param b - The second PointBuffer (addend)
   * @param out - The output PointBuffer to store the result
   * @throws {Error} If buffers have different sizes or if any buffer is shared
   *
   * @example
   * ```typescript
   * // Create three buffers with the same size
   * const a = PointBuffer.create(100);
   * const b = PointBuffer.create(100);
   * const out = PointBuffer.create(100);
   *
   * // Initialize buffers with data
   * for (let i = 0; i < a.size(); i++) {
   *   a.at(i).x = i;
   *   a.at(i).y = i * 2;
   *   b.at(i).x = i * 3;
   *   b.at(i).y = i * 4;
   * }
   *
   * // Perform batch addition
   * PointBuffer.addBuffers(a, b, out);
   *
   * // Result: out[i] = a[i] + b[i] for all points
   * ```
   */
  static addBuffers(a: PointBuffer, b: PointBuffer, out: PointBuffer): void {
    if (a.shared || b.shared || out.shared) {
      throw new Error(
        "PointBuffer.addBuffers: Batch operations not supported on shared buffers"
      );
    }
    if (a.size() !== b.size() || a.size() !== out.size()) {
      throw new Error(
        "PointBuffer.addBuffers: All buffers must have the same size"
      );
    }
    for (let i = 0; i < a.buffer.length; i++) {
      out.buffer[i] = a.buffer[i] + b.buffer[i];
    }
  }

  /**
   * Subtracts all points in buffer b from buffer a, storing the result in buffer out.
   * This is a performance-optimized batch operation.
   *
   * @param a - The first PointBuffer (minuend)
   * @param b - The second PointBuffer (subtrahend)
   * @param out - The output PointBuffer to store the result
   * @throws {Error} If buffers have different sizes or if any buffer is shared
   *
   * @example
   * ```typescript
   * // Create three buffers with the same size
   * const a = PointBuffer.create(100);
   * const b = PointBuffer.create(100);
   * const out = PointBuffer.create(100);
   *
   * // Initialize buffers with data
   * for (let i = 0; i < a.size(); i++) {
   *   a.at(i).x = i * 5;
   *   a.at(i).y = i * 6;
   *   b.at(i).x = i * 2;
   *   b.at(i).y = i * 3;
   * }
   *
   * // Perform batch subtraction
   * PointBuffer.subtractBuffers(a, b, out);
   *
   * // Result: out[i] = a[i] - b[i] for all points
   * ```
   */
  static subtractBuffers(
    a: PointBuffer,
    b: PointBuffer,
    out: PointBuffer
  ): void {
    if (a.shared || b.shared || out.shared) {
      throw new Error(
        "PointBuffer.subtractBuffers: Batch operations not supported on shared buffers"
      );
    }
    if (a.size() !== b.size() || a.size() !== out.size()) {
      throw new Error(
        "PointBuffer.subtractBuffers: All buffers must have the same size"
      );
    }
    for (let i = 0; i < a.buffer.length; i++) {
      out.buffer[i] = a.buffer[i] - b.buffer[i];
    }
  }

  /**
   * Scales all points in buffer a by the given factor, storing the result in buffer out.
   * This is a performance-optimized batch operation.
   *
   * @param a - The input PointBuffer to scale
   * @param factor - The scaling factor
   * @param out - The output PointBuffer to store the result
   * @throws {Error} If buffers have different sizes or if any buffer is shared
   *
   * @example
   * ```typescript
   * // Create two buffers with the same size
   * const a = PointBuffer.create(100);
   * const out = PointBuffer.create(100);
   *
   * // Initialize buffer with data
   * for (let i = 0; i < a.size(); i++) {
   *   a.at(i).x = i;
   *   a.at(i).y = i + 1;
   * }
   *
   * // Perform batch scaling
   * PointBuffer.scaleBuffers(a, 2.5, out);
   *
   * // Result: out[i] = a[i] * 2.5 for all points
   * ```
   */
  static scaleBuffers(a: PointBuffer, factor: number, out: PointBuffer): void {
    if (a.shared || out.shared) {
      throw new Error(
        "PointBuffer.scaleBuffers: Batch operations not supported on shared buffers"
      );
    }
    if (a.size() !== out.size()) {
      throw new Error(
        "PointBuffer.scaleBuffers: Input and output buffers must have the same size"
      );
    }
    for (let i = 0; i < a.buffer.length; i++) {
      out.buffer[i] = a.buffer[i] * factor;
    }
  }
}
