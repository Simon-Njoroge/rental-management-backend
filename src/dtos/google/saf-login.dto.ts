export class GoogleLoginDto {
  sub!: string;
  email!: string;
  name!: string;
  picture?: string;
}

export class SafaricomLoginDto {
  phoneNumber!: string;
  safaricomId!: string;
}
