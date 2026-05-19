const fake = { async list(){return []}, async filter(){return []}, async create(d){return {id:String(Date.now()),...d}}, async update(){return{}}, async delete(){return{}} };
export const base44 = { entities: { BlogPost: fake, BlogCategory: fake, BlogTag: fake, BlogComment: fake } };
