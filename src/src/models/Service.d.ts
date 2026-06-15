import mongoose from 'mongoose';
export declare const Service: mongoose.Model<{
    description: string;
    title: string;
    category: string;
    provider: mongoose.Types.ObjectId;
    price: number;
    averageRating: number;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    category: string;
    provider: mongoose.Types.ObjectId;
    price: number;
    averageRating: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    category: string;
    provider: mongoose.Types.ObjectId;
    price: number;
    averageRating: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    description: string;
    title: string;
    category: string;
    provider: mongoose.Types.ObjectId;
    price: number;
    averageRating: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    category: string;
    provider: mongoose.Types.ObjectId;
    price: number;
    averageRating: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    category: string;
    provider: mongoose.Types.ObjectId;
    price: number;
    averageRating: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    description: string;
    title: string;
    category: string;
    provider: mongoose.Types.ObjectId;
    price: number;
    averageRating: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    description: string;
    title: string;
    category: string;
    provider: mongoose.Types.ObjectId;
    price: number;
    averageRating: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Service.d.ts.map