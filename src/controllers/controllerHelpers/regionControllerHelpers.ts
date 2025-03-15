import { Includeable, Op } from "sequelize";
import Nation from "../../models/Nation";
import { normalizeString } from "../../utils";
import Region from "../../models/Region";


export const stdInclude: Includeable[] = [
    {
      model: Nation,
      attributes: ['id', 'name'],
      through: { attributes: [] },  // Exclude attributes from the join table
    },
];



export const getRegionDetails = async (regionId: number) => {
    try {
      // First, check if the region is already cached
    //   const cachedRegion = await getRegionCache(regionId);
    //   if (cachedRegion) {
    //     return cachedRegion; // If cached, return the cached region
    //   }
  
      // Fetch the region with its nations
      const region = await Region.findOne({
        where: { id: regionId },
        include: {
          model: Nation,
          through: { attributes: [] }, // Exclude any attributes from the join table
          attributes: ['id', 'name'],  // Only fetch the nation `id` and `name`
        },
      });
  
      if (!region) {
        return null;  // Return null if no region is found
      }

    // Type assertion to handle associations, we'll make sure the associations are safely accessed
    const typedRegion = region as Region & {
        Nations: Nation[]; 
    };

    // Prepare the region object in the format you want
    const detailedRegion = {
    id: region.id,
    name: region.name,
    nations: typedRegion.Nations.map((nation) => ({
        id: nation.id,
        name: nation.name,
    })),
    };

    // Cache the region details after fetching from DB
    //await setRegionCache(regionId, detailedRegion);

      return detailedRegion;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching region details');
    }
};
  
export const generateRegionFilterConditions = (queryParams: any) => {
    const { search, nation } = queryParams;
  
    let whereConditions: any = {}; // Initialize the conditions object
    let includeConditions: Includeable[] = []; // Initialize includes for related models
  
    // Add conditions for searching within region names or nation names
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },  // Match region name
        { '$Nations.name$': { [Op.iLike]: `%${search}%` } },  // Match nation name within a region
      ];
      includeConditions.push({
        model: Nation,
        through: { attributes: [] },  // Exclude join table attributes
        attributes: ['name'],
      });
    }
  
    // Add condition for filtering by nation ID if provided
    if (nation) {
      whereConditions['$Nations.id$'] = { [Op.eq]: nation };  // Match a specific nation ID
      includeConditions.push({
        model: Nation,
        through: { attributes: [] },
        attributes: ['id', 'name'],
      });
    }
  
    return { whereConditions, includeConditions };
};
