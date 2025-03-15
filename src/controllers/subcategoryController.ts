import { Request, Response } from "express";
import { validateQueryParams } from "../utils";
import Subcategory from "../models/Subcategory";


export const getAllSubcategories = async(req:Request, res:Response) =>{
    const {isValid, queryParams, errors} = validateQueryParams(req);
    if(!isValid){
        res.status(400).json({errors : errors});
        return;
    }
    let {sort, limit=10, page=1, search} = queryParams;

    limit = Math.max(1, Math.min(Number(limit), 100));
    page = Math.max(1, Number(page));

    let order : any = [];
    // Handle sort parameter
    if (sort) {
        order = [[sort, 'ASC']];
    } else {
        order = [['name', 'ASC']]; // Default sorting by region name
    }


    try{
        const rows = await Subcategory.findAll({
            limit,
            offset : (page-1)*limit,
            order
        })

        if(rows.length===0){
            res.status(200).json({
                totalResults: 0,
                results : []
            });
            return;
        }
        res.status(200).json({
            totalResults : rows.length,
            results : rows
        })

    }catch(error){
        console.log(error);
        res.status(500).json({ message: 'Error fetching subcategories from the database', error:`${(error as Error).name}: ${(error as Error).message}` })
    }
}