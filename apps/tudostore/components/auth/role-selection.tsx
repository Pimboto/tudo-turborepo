"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/lib/api";
import { 
  User, 
  Building, 
  Sparkles,
  CheckCircle
} from "lucide-react";

interface RoleSelectionProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  onContinue: () => void;
  loading?: boolean;
}

export default function RoleSelection({ 
  selectedRole, 
  onRoleSelect, 
  onContinue,
  loading = false 
}: RoleSelectionProps) {

  const roleOptions = [
    {
      role: 'CLIENT' as UserRole,
      icon: User,
      title: 'Join as a Client',
      description: 'Discover and book fitness classes near you',
      features: [
        'Book fitness classes',
        'Earn and use credits',
        'Track your fitness journey',
        'Connect with studios'
      ],
      color: 'bg-gradient-to-br from-primary/10 to-accent/10',
      borderColor: 'border-primary/20',
      iconColor: 'text-primary',
      popular: true
    },
    {
      role: 'PARTNER' as UserRole,
      icon: Building,
      title: 'Join as a Partner',
      description: 'Grow your fitness business with our platform',
      features: [
        'Manage your studios',
        'Create and schedule classes',
        'Track earnings and analytics',
        'Reach more clients'
      ],
      color: 'bg-gradient-to-br from-secondary/10 to-accent/10',
      borderColor: 'border-secondary/20',
      iconColor: 'text-secondary',
      popular: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 animate-fade-in">
        <h2 className="text-2xl font-heading gradient-text">
          Choose Your Journey
        </h2>
        <p className="text-muted-foreground">
          Select how you want to experience TUDO Fitness
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-animation">
        {roleOptions.map((option, index) => {
          const isSelected = selectedRole === option.role;
          const Icon = option.icon;
          
          return (
            <div
              key={option.role}
              className="animate-slide-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <Card 
                className={`
                  relative cursor-pointer transition-all duration-300 hover-lift
                  ${isSelected 
                    ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                    : 'hover:shadow-md'
                  }
                  ${option.color}
                  ${option.borderColor}
                `}
                onClick={() => onRoleSelect(option.role)}
              >
                {/* Popular Badge */}
                {option.popular && (
                  <div className="absolute -top-2 left-4">
                    <Badge className="bg-primary text-primary-foreground">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-background ${option.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {isSelected && (
                      <div className="animate-scale-in">
                        <CheckCircle className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-heading">
                    {option.title}
                  </CardTitle>
                  <CardDescription>
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {option.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-center text-sm text-muted-foreground animate-slide-in-left"
                        style={{ animationDelay: `${0.4 + index * 0.1 + featureIndex * 0.05}s` }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="pt-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <Button
          onClick={onContinue}
          disabled={!selectedRole || loading}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Setting up your account...
            </div>
          ) : (
            `Continue as ${selectedRole === 'CLIENT' ? 'Client' : 'Partner'}`
          )}
        </Button>
      </div>

      {/* Info Text */}
      <p 
        className="text-xs text-center text-muted-foreground animate-fade-in"
        style={{ animationDelay: '0.8s' }}
      >
        You can always change your role later in your account settings
      </p>
    </div>
  );
} 
