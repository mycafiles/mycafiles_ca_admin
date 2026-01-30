import { IconBuildingBank, IconShieldCheck, IconCircleCheck, IconRefresh } from '@tabler/icons-react';

const BrandingPanel = () => {
    return (
        <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-b from-[#2563EB] to-[#1E40AF] p-16 text-white justify-between relative overflow-hidden">
            {/* Abstract background shapes */}
            <div className="absolute top-0 right-0 size-[600px] bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 size-[400px] bg-blue-900/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-24">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20 text-white flex items-center justify-center">
                        <IconBuildingBank size={24} stroke={2} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">My CA Files</h1>
                </div>

                <div className="space-y-12 max-w-lg">
                    <h2 className="text-5xl font-bold leading-[1.1] tracking-tight mb-0">
                        Secure. Automated. Compliant.
                    </h2>
                    <p className="text-blue-100/90 text-md leading-relaxed font-medium my-6">
                        The trusted platform for Chartered Accountants to manage client data and compliance effortlessly.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 shadow-sm shrink-0">
                                <IconShieldCheck size={28} stroke={1.5} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-md leading-tight">Secure Client Data</h4>
                                <p className="text-blue-100/70 text-sm mt-0.5">Bank-grade encryption for all sensitive financial records.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 shadow-sm shrink-0">
                                <IconCircleCheck size={28} stroke={1.5} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-md leading-tight">Automated Compliance</h4>
                                <p className="text-blue-100/70 text-sm mt-0.5">Stay ahead of deadlines with automated tracking and alerts.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 shadow-sm shrink-0">
                                <IconRefresh size={28} stroke={1.5} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-md leading-tight">Real-time Sync</h4>
                                <p className="text-blue-100/70 text-sm mt-0.5">Seamless synchronization across authorized devices.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex gap-6 text-[13px] text-blue-200/60 font-medium">
                <span>© 2024 My CA Files Inc.</span>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
        </div>
    );
};

export default BrandingPanel;
