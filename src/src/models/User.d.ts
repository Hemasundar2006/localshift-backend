import mongoose from 'mongoose';
export declare const User: mongoose.Model<{
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin";
    isPhoneVerified: boolean;
    otp?: string | null;
    otpExpiry?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin";
    isPhoneVerified: boolean;
    otp?: string | null;
    otpExpiry?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin";
    isPhoneVerified: boolean;
    otp?: string | null;
    otpExpiry?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin";
    isPhoneVerified: boolean;
    otp?: string | null;
    otpExpiry?: NativeDate | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin";
    isPhoneVerified: boolean;
    otp?: string | null;
    otpExpiry?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin";
    isPhoneVerified: boolean;
    otp?: string | null;
    otpExpiry?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin";
    isPhoneVerified: boolean;
    otp?: string | null;
    otpExpiry?: NativeDate | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin";
    isPhoneVerified: boolean;
    otp?: string | null;
    otpExpiry?: NativeDate | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=User.d.ts.map