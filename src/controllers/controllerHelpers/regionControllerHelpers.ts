import { Includeable, Op, Sequelize } from "sequelize";
import Nation from "../../models/Nation";
import { normalizeString } from "../../utils";
import Region from "../../models/Region";
import RegionCache from "../../caching/RegionCaching";


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
      const cachedRegion = await RegionCache.getCache(regionId);
      if (cachedRegion) {
        return cachedRegion; // If cached, return the cached region
      }
  
      // Fetch the region with its nations
      const region = await Region.findOne({
        where: { id: regionId },
        include: {
          model: Nation,
          through: { attributes: [] }, // Exclude any attributes from the join table
          attributes: ['id', 'name'],  // Only fetch the nation `id` and `name`
        },
      });
  
      if (!region) return null;  // Return null if no region is found

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
      await RegionCache.setCache(regionId, detailedRegion);

      return detailedRegion;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching region details');
    }
};

export const generateRegionFilterConditions = (queryParams: any) => {
  const { search, nation } = queryParams;

  let whereConditions: any = {};  // Initialize where conditions
  let includeConditions: Includeable[] = [];  // Initialize include conditions for associations

  // If there's a search query, filter regions by name
  if (search) {
    whereConditions.name = { [Op.iLike]: `%${search}%` };  // Match regions by name (case-insensitive)
  }

  // If there's a nation filter
  if (nation) {
    const isNationId = !isNaN(Number(nation));  // Check if 'nation' is a number (nation ID)
  }


  return { whereConditions, includeConditions };
};
