import mongoose from 'mongoose';
export declare const Job: mongoose.Model<{
    date: NativeDate;
    description: string;
    title: string;
    employer: mongoose.Types.ObjectId;
    payRate: number;
    status: "open" | "assigned" | "in-progress" | "completed" | "cancelled";
    startTime: string;
    endTime: string;
    location: string;
    worker?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    date: NativeDate;
    description: string;
    title: string;
    employer: mongoose.Types.ObjectId;
    payRate: number;
    status: "open" | "assigned" | "in-progress" | "completed" | "cancelled";
    startTime: string;
    endTime: string;
    location: string;
    worker?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    date: NativeDate;
    description: string;
    title: string;
    employer: mongoose.Types.ObjectId;
    payRate: number;
    status: "open" | "assigned" | "in-progress" | "completed" | "cancelled";
    startTime: string;
    endTime: string;
    location: string;
    worker?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    date: NativeDate;
    description: string;
    title: string;
    employer: mongoose.Types.ObjectId;
    payRate: number;
    status: "open" | "assigned" | "in-progress" | "completed" | "cancelled";
    startTime: string;
    endTime: string;
    location: string;
    worker?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    date: NativeDate;
    description: string;
    title: string;
    employer: mongoose.Types.ObjectId;
    payRate: number;
    status: "open" | "assigned" | "in-progress" | "completed" | "cancelled";
    startTime: string;
    endTime: string;
    location: string;
    worker?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    date: NativeDate;
    description: string;
    title: string;
    employer: mongoose.Types.ObjectId;
    payRate: number;
    status: "open" | "assigned" | "in-progress" | "completed" | "cancelled";
    startTime: string;
    endTime: string;
    location: string;
    worker?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    date: NativeDate;
    description: string;
    title: string;
    employer: mongoose.Types.ObjectId;
    payRate: number;
    status: "open" | "assigned" | "in-progress" | "completed" | "cancelled";
    startTime: string;
    endTime: string;
    location: string;
    worker?: mongoose.Types.ObjectId | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    date: NativeDate;
    description: string;
    title: string;
    employer: mongoose.Types.ObjectId;
    payRate: number;
    status: "open" | "assigned" | "in-progress" | "completed" | "cancelled";
    startTime: string;
    endTime: string;
    location: string;
    worker?: mongoose.Types.ObjectId | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Job.d.ts.map