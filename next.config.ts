import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 홈 디렉터리의 떠도는 lockfile 때문에 워크스페이스 루트가 오추론되는 것 방지 —
  // 파일 트레이싱 루트를 이 프로젝트로 고정 (배포 대비).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
