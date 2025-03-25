import { Op } from "sequelize";
import { Includeable } from "sequelize/types/model";

export const validSortFields = ['id', 'name'];
export const generateIngredientFilterConditions = (queryParams: any) => {
    const { search } = queryParams;
  
    let whereConditions: any = {}; // Initialize the conditions object
    let includeConditions: Includeable[] = []; // Initialize includes for related models
  
  
    // If there's a search term, include additional fields (name, description, ingredients)
    if (search) {
        whereConditions[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
        ];
    }

    return { whereConditions, includeConditions };
};