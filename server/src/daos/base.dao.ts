import {
    Model,
    ModelStatic,
    WhereOptions,
    CreateOptions,
    FindOptions,
    UpdateOptions,
    DestroyOptions,
} from "sequelize";

/**
 * Base DAO (Data Access Object)
 * Provides common database operations for all entities
 * Follows CQRS pattern with separated read/write operations
 */
export abstract class BaseDAO<
    TModel extends Model,
    TAttributes,
    TCreationAttributes
> {
    protected model: ModelStatic<TModel>;

    constructor(model: ModelStatic<TModel>) {
        this.model = model;
    }

    // QUERY OPERATIONS (Read)

    /**
     * Find a single record by primary key
     */
    async findById(
        id: number | string,
        options?: FindOptions
    ): Promise<TModel | null> {
        try {
            return await this.model.findByPk(id, options);
        } catch (error) {
            throw new Error(
                `Failed to find ${this.model.name} by ID: ${error}`
            );
        }
    }

    /**
     * Find a single record by conditions
     */
    async findOne(
        where: WhereOptions<TAttributes>,
        options?: FindOptions
    ): Promise<TModel | null> {
        try {
            return await this.model.findOne({ where, ...options });
        } catch (error) {
            throw new Error(`Failed to find ${this.model.name}: ${error}`);
        }
    }

    /**
     * Find all records matching conditions
     */
    async findAll(options?: FindOptions): Promise<TModel[]> {
        try {
            return await this.model.findAll(options);
        } catch (error) {
            throw new Error(`Failed to find all ${this.model.name}: ${error}`);
        }
    }

    /**
     * Find records with pagination
     */
    async findAndCountAll(
        options?: FindOptions
    ): Promise<{ rows: TModel[]; count: number }> {
        try {
            return await this.model.findAndCountAll(options);
        } catch (error) {
            throw new Error(
                `Failed to find and count ${this.model.name}: ${error}`
            );
        }
    }

    /**
     * Count records matching conditions
     */
    async count(where?: WhereOptions<TAttributes>): Promise<number> {
        try {
            return await this.model.count({ where });
        } catch (error) {
            throw new Error(`Failed to count ${this.model.name}: ${error}`);
        }
    }

    /**
     * Check if record exists
     */
    async exists(where: WhereOptions<TAttributes>): Promise<boolean> {
        try {
            const count = await this.model.count({ where });
            return count > 0;
        } catch (error) {
            throw new Error(
                `Failed to check if ${this.model.name} exists: ${error}`
            );
        }
    }

    // COMMAND OPERATIONS (Write)

    /**
     * Create a new record
     */
    async create(
        data: TCreationAttributes,
        options?: CreateOptions
    ): Promise<TModel> {
        try {
            return await this.model.create(data as any, options);
        } catch (error) {
            throw new Error(`Failed to create ${this.model.name}: ${error}`);
        }
    }

    /**
     * Create multiple records
     */
    async bulkCreate(
        data: TCreationAttributes[],
        options?: CreateOptions
    ): Promise<TModel[]> {
        try {
            return await this.model.bulkCreate(data as any[], options);
        } catch (error) {
            throw new Error(
                `Failed to bulk create ${this.model.name}: ${error}`
            );
        }
    }

    /**
     * Update records matching conditions
     */
    async update(
        data: Partial<TAttributes>,
        where: WhereOptions<TAttributes>,
        options?: UpdateOptions
    ): Promise<number> {
        try {
            const [affectedCount] = await this.model.update(data, {
                where,
                ...options,
            });
            return affectedCount;
        } catch (error) {
            throw new Error(`Failed to update ${this.model.name}: ${error}`);
        }
    }

    /**
     * Update a single record by ID
     */
    async updateById(
        id: number | string,
        data: Partial<TAttributes>,
        options?: UpdateOptions
    ): Promise<TModel | null> {
        try {
            const [affectedCount] = await this.model.update(data, {
                where: { id } as any,
                ...options,
            });

            if (affectedCount > 0) {
                return await this.findById(id);
            }

            return null;
        } catch (error) {
            throw new Error(
                `Failed to update ${this.model.name} by ID: ${error}`
            );
        }
    }

    /**
     * Delete records matching conditions
     */
    async delete(
        where: WhereOptions<TAttributes>,
        options?: DestroyOptions
    ): Promise<number> {
        try {
            return await this.model.destroy({ where, ...options });
        } catch (error) {
            throw new Error(`Failed to delete ${this.model.name}: ${error}`);
        }
    }

    /**
     * Delete a single record by ID
     */
    async deleteById(
        id: number | string,
        options?: DestroyOptions
    ): Promise<boolean> {
        try {
            const deletedCount = await this.model.destroy({
                where: { id } as any,
                ...options,
            });
            return deletedCount > 0;
        } catch (error) {
            throw new Error(
                `Failed to delete ${this.model.name} by ID: ${error}`
            );
        }
    }

    /**
     * Upsert (insert or update) a record
     */
    async upsert(
        data: TCreationAttributes,
        options?: CreateOptions
    ): Promise<[TModel, boolean]> {
        try {
            const result = await this.model.upsert(data as any, options);
            return [result[0], result[1] ?? false];
        } catch (error) {
            throw new Error(`Failed to upsert ${this.model.name}: ${error}`);
        }
    }
}
